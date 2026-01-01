/**
 * Google Sheets Parser
 * Parses JSON data from opensheet API into Transaction objects
 */

import { Transaction } from '../types';
import { parseEarningMonth } from './dateUtils';
import { toTitleCase, getNumber, normalizePlatform, normalizePercentage } from './dataTransformers';

/**
 * Parses a date value from various formats
 * @param val - Date value (string, number, or Date)
 * @returns ISO date string
 */
const parseDateValue = (val: any): string => {
  if (!val) return new Date().toISOString();
  
  // Try parsing as date string
  const date = new Date(val);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  return new Date().toISOString();
};

/**
 * Safely gets a value from the row object
 * @param row - Row object from opensheet
 * @param keys - Possible keys to match (case-insensitive)
 * @returns Value or undefined
 */
const getRowValue = (row: any, ...keys: string[]): any => {
  // Try each possible key
  for (const key of keys) {
    // Try exact match first
    if (row[key] !== undefined && row[key] !== '' && row[key] !== '-') {
      return row[key];
    }
    
    // Try case-insensitive match
    const lowerKey = key.toLowerCase();
    for (const k in row) {
      if (k.toLowerCase() === lowerKey && row[k] !== '' && row[k] !== '-') {
        return row[k];
      }
      
      // Try partial match
      if (k.toLowerCase().includes(lowerKey) && row[k] !== '' && row[k] !== '-') {
        return row[k];
      }
    }
  }
  
  return undefined;
};

/**
 * Validates that the JSON data has the expected structure
 * @param data - Array of row objects
 * @returns True if valid structure
 */
const validateIncomeSheetStructure = (data: any[]): boolean => {
  if (!data || !Array.isArray(data) || data.length < 2) return false;

  // Just check if we have some data rows
  const dataRows = data.filter(row => {
    const values = Object.values(row);
    return values.some(val => val && val !== '-' && val !== '');
  });
  
  return dataRows.length > 0;
};

/**
 * Transforms a JSON row from opensheet to Transaction
 * Matches the exact template structure:
 * Month, Release, Received, Day(s), Platform, Method, Rate, Revenue ($), Revenue (Rs), 
 * Received, Tax($), Tax(Rs), Tax(%), Capital($), Capital(Rs), status
 * @param row - JSON row object 
 * @param index - Row index
 * @returns Transaction object
 */
const transformJSONRow = (row: any, index: number): Transaction => {
  // Helper to extract numeric value from strings like "Rs46,458", "$164.88", or "3.77%"
  const extractNumber = (val: string | number): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    
    // Remove currency symbols, commas, percent signs, and "Rs" prefix
    const cleaned = String(val).replace(/[Rs$,%]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Extract values using exact column names from template
  const earningMonth = getRowValue(row, 'Month'); // e.g., "April", "May", "June"
  const releaseDate = getRowValue(row, 'Release'); // e.g., "May,23"
  const receivedDate = getRowValue(row, 'Received'); // e.g., "May,30"
  const durationDays = getRowValue(row, 'Day(s)', 'Days');
  const platform = getRowValue(row, 'Platform');
  const method = getRowValue(row, 'Method');
  const rate = getRowValue(row, 'Rate');
  const revenueUSD = getRowValue(row, 'Revenue ($)');
  const revenuePKR = getRowValue(row, 'Revenue (Rs)');
  const receivedPKR = getRowValue(row, 'Received'); // Second "Received" column
  const taxUSD = getRowValue(row, 'Tax($)', 'Tax ($)');
  const taxPKR = getRowValue(row, 'Tax(Rs)', 'Tax (Rs)');
  const taxPercent = getRowValue(row, 'Tax(%)', 'Tax (%)');
  const capitalUSD = getRowValue(row, 'Capital($)', 'Capital ($)');
  const capitalPKR = getRowValue(row, 'Capital(Rs)', 'Capital (Rs)');
  const status = getRowValue(row, 'status', 'Status');

  // Parse dates from "May,23" format
  const releaseDateISO = parseDateValue(releaseDate);
  const receivedDateISO = receivedDate && receivedDate !== '-' ? parseDateValue(receivedDate) : null;
  
  // Convert month name to ISO date format (e.g., "April" → "2024-04-01")
  const earningMonthISO = parseEarningMonth(earningMonth, releaseDateISO);

  return {
    id: `txn-${Date.now()}-${index}`,
    date: releaseDateISO,
    earningMonth: earningMonthISO, // Convert month name to ISO date
    releaseDate: releaseDateISO,
    receivedDate: receivedDateISO,
    durationDays: extractNumber(durationDays),
    platform: normalizePlatform(platform),
    method: method && method !== '-' ? String(method) : undefined,
    rate: extractNumber(rate),
    expectedUsd: extractNumber(revenueUSD),
    expectedPkr: extractNumber(revenuePKR),
    receivedPkr: extractNumber(receivedPKR),
    taxUsd: extractNumber(taxUSD),
    taxPkr: extractNumber(taxPKR),
    taxPercent: extractNumber(taxPercent),
    netUsd: extractNumber(capitalUSD),
    netPkr: extractNumber(capitalPKR),
    status: status ? toTitleCase(String(status)) : 'Pending',
  };
};

/**
 * Parses JSON data from opensheet API into Transaction array
 * @param jsonData - Array of row objects from opensheet
 * @returns Array of transactions
 * @throws Error if JSON format is invalid
 */
export const parseGoogleSheetsJSON = (jsonData: any[]): Transaction[] => {
  try {
    if (!jsonData || !Array.isArray(jsonData)) {
      throw new Error('Invalid data format. Expected an array of objects.');
    }

    if (jsonData.length === 0) {
      throw new Error('Sheet is empty. Please add transaction data.');
    }

    // Validate structure  
    if (!validateIncomeSheetStructure(jsonData)) {
      throw new Error('Sheet appears to be empty or has no valid data rows.');
    }

    // Skip first row (header) and process all data rows
    const transactions = jsonData
      .slice(1) // Skip header row
      .filter(row => {
        // Filter out empty rows
        const values = Object.values(row);
        return values.some(val => val && val !== '-' && val !== '');
      })
      .map((row, index) => transformJSONRow(row, index))
      .filter(txn => txn.expectedUsd > 0 || txn.netUsd > 0 || txn.expectedPkr > 0)
      .sort((a, b) => {
        // Sort by release date chronologically (oldest first)
        const dateA = new Date(a.releaseDate).getTime();
        const dateB = new Date(b.releaseDate).getTime();
        return dateA - dateB;
      });

    console.log('📊 Parsed transactions:', transactions.length, transactions);

    if (transactions.length === 0) {
      throw new Error('No valid transaction data found in the sheet');
    }

    return transactions;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse sheet data');
  }
};

/**
 * Previews the first few transactions from JSON without full processing
 * Useful for showing a preview before importing
 * @param jsonData - Array of row objects
 * @param count - Number of transactions to preview (default: 5)
 * @returns Array of preview transactions
 */
export const previewSheetData = (jsonData: any[], count: number = 5): Transaction[] => {
  const allTransactions = parseGoogleSheetsJSON(jsonData);
  return allTransactions.slice(0, count);
};

