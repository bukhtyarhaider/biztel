import * as XLSX from 'xlsx';
import { Transaction, Report } from '../types';
import { parseExcelDate, parseEarningMonth } from './dateUtils';
import { toTitleCase, getNumber, normalizePlatform, normalizePercentage } from './dataTransformers';

export interface ParseOptions {
  companyName: string;
}

/**
 * Transforms a row from the Income sheet to a Transaction object
 * @param row - Excel row data
 * @param index - Row index for ID generation
 * @returns Transaction object
 */
const transformIncomeRow = (row: any[], index: number): Transaction => {
  const releaseDate = parseExcelDate(row[1]);
  const earningMonth = parseEarningMonth(row[0], releaseDate);
  
  return {
    id: `txn-${Date.now()}-${index}`,
    date: releaseDate,
    earningMonth,
    releaseDate,
    receivedDate: row[2] ? parseExcelDate(row[2]) : null,
    durationDays: getNumber(row[3]),
    platform: normalizePlatform(row[4]),
    method: row[5] ? String(row[5]) : undefined,
    rate: getNumber(row[6]),
    expectedUsd: getNumber(row[7]),
    expectedPkr: getNumber(row[8]),
    receivedPkr: getNumber(row[14]),
    taxUsd: getNumber(row[10]),
    taxPkr: getNumber(row[11]),
    taxPercent: normalizePercentage(row[12]),
    netUsd: getNumber(row[13]),
    netPkr: getNumber(row[14]),
    status: row[15] ? toTitleCase(String(row[15])) : 'Semifinal',
  };
};

/**
 * Transforms a generic Excel row to a Transaction object
 * Used as fallback when Income sheet is not present
 * @param row - Excel row data
 * @param index - Row index for ID generation
 * @returns Transaction object
 */
const transformGenericRow = (row: any, index: number): Transaction => {
  let dateStr = new Date().toISOString();
  
  if (row.Date) {
    if (typeof row.Date === 'number') {
      dateStr = parseExcelDate(row.Date);
    } else {
      const parsed = new Date(row.Date);
      if (!isNaN(parsed.getTime())) {
        dateStr = parsed.toISOString();
      }
    }
  }

  return {
    id: `txn-${Date.now()}-${index}`,
    date: dateStr,
    description: row.Description || row.Particulars || 'Transaction',
    amount: getNumber(row.Amount),
    type: (row.Debit || row.Withdrawal) ? 'Debit' : 'Credit',
    category: row.Category || 'General',
    status: row.Status || 'Completed',
    receivedPkr: getNumber(row['Received PKR'] || row.Amount),
    bankCharges: getNumber(row['Bank Charges']),
    taxUsd: getNumber(row['Tax USD']),
    netUsd: getNumber(row['Net USD'] || row.Amount),
  } as Transaction;
};

/**
 * Processes an Excel file and converts it to a Report
 * @param file - Excel file to process
 * @param options - Parse options including company name
 * @returns Promise resolving to Report object
 */
export const processFile = async (file: File, options: ParseOptions): Promise<Report> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        let transactions: Transaction[] = [];

        if (workbook.SheetNames.includes('Income')) {
          // Process Income sheet with specific structure
          const sheet = workbook.Sheets['Income'];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          
          // Data starts from index 3 (Row 4 in Excel) based on inspection
          const dataRows = jsonData.slice(3);

          transactions = dataRows
            .filter(row => row && row.length > 0 && row[1])
            .map((row, index) => transformIncomeRow(row, index));

        } else {
          // Fallback to generic simple sheet parsing
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          transactions = jsonData.map((row: any, index: number) => 
            transformGenericRow(row, index)
          );
        }

        // Create new report
        const newReport: Report = {
          id: `rep-${Date.now()}`,
          companyName: options.companyName,
          generatedAt: new Date().toISOString(),
          transactions,
          status: 'Draft'
        };

        resolve(newReport);
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsBinaryString(file);
  });
};
