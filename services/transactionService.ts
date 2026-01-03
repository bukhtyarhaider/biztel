/**
 * Transaction Service
 * Handles all business logic related to transactions
 */

import { Transaction } from '../types';

export type SortKey = 'earningMonth' | 'netUsd' | 'platform' | 'status' | 'releaseDate';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

/**
 * Filters transactions based on a search query
 * Searches across platform, status, and method fields
 * @param transactions - Array of transactions
 * @param query - Search query string
 * @returns Filtered transactions
 */
export const filterTransactions = (transactions: Transaction[], query: string): Transaction[] => {
  if (!query) return transactions;
  
  const lowerQuery = query.toLowerCase();
  
  return transactions.filter(t => 
    (t.platform?.toLowerCase() || '').includes(lowerQuery) || 
    (t.status?.toLowerCase() || '').includes(lowerQuery) ||
    (t.method?.toLowerCase() || '').includes(lowerQuery)
  );
};

/**
 * Sorts transactions based on sort configuration
 * @param transactions - Array of transactions
 * @param sortConfig - Sort configuration
 * @returns Sorted transactions
 */
export const sortTransactions = (
  transactions: Transaction[],
  sortConfig: SortConfig
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Calculates total net USD from transactions
 * @param transactions - Array of transactions
 * @returns Total net USD
 */
export const calculateTotalNet = (transactions: Transaction[]): number => {
  return transactions.reduce((acc, curr) => acc + (curr.netUsd || 0), 0);
};

/**
 * Calculates total expected USD (Gross) from transactions
 * @param transactions - Array of transactions
 * @returns Total expected USD
 */
export const calculateTotalExpected = (transactions: Transaction[]): number => {
  return transactions.reduce((acc, curr) => acc + (curr.expectedUsd || 0), 0);
};

/**
 * Calculates total revenue by status
 * @param transactions - Array of transactions
 * @param status - Status to filter by
 * @returns Total revenue for the given status
 */
export const calculateRevenueByStatus = (
  transactions: Transaction[],
  status: string
): number => {
  return transactions
    .filter(t => t.status === status)
    .reduce((acc, curr) => acc + (curr.netUsd || 0), 0);
};

/**
 * Calculates total PKR received
 * @param transactions - Array of transactions
 * @param status - Optional status filter
 * @returns Total PKR received
 */
export const calculateTotalPKR = (
  transactions: Transaction[],
  status?: string
): number => {
  const filtered = status
    ? transactions.filter(t => t.status === status)
    : transactions;
    
  return filtered.reduce((acc, curr) => acc + (curr.receivedPkr || 0), 0);
};

/**
 * Calculates total tax USD
 * @param transactions - Array of transactions
 * @returns Total tax USD
 */
export const calculateTotalTax = (transactions: Transaction[]): number => {
  return transactions.reduce((acc, curr) => acc + (curr.taxUsd || 0), 0);
};

/**
 * Groups transactions by platform
 * @param transactions - Array of transactions
 * @returns Map of platform to transactions
 */
export const groupByPlatform = (transactions: Transaction[]): Map<string, Transaction[]> => {
  const grouped = new Map<string, Transaction[]>();
  
  transactions.forEach(txn => {
    const platform = txn.platform || 'Unknown';
    if (!grouped.has(platform)) {
      grouped.set(platform, []);
    }
    grouped.get(platform)!.push(txn);
  });
  
  return grouped;
};

/**
 * Groups transactions by method (bank)
 * @param transactions - Array of transactions
 * @returns Map of method to transactions
 */
export const groupByMethod = (transactions: Transaction[]): Map<string, Transaction[]> => {
  const grouped = new Map<string, Transaction[]>();
  
  transactions.forEach(txn => {
    const method = txn.method || 'Unknown';
    if (!grouped.has(method)) {
      grouped.set(method, []);
    }
    grouped.get(method)!.push(txn);
  });
  
  return grouped;
};
