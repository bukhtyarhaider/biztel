/**
 * Type Guards and Validation Utilities
 */

import { Transaction, Report } from '../types';

/**
 * Type guard to check if a value is a valid Transaction
 * @param value - Value to check
 * @returns True if value is a Transaction
 */
export const isTransaction = (value: any): value is Transaction => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.date === 'string' &&
    typeof value.receivedPkr === 'number' &&
    typeof value.taxUsd === 'number' &&
    typeof value.netUsd === 'number' &&
    typeof value.status === 'string'
  );
};

/**
 * Type guard to check if a value is a valid Report
 * @param value - Value to check
 * @returns True if value is a Report
 */
export const isReport = (value: any): value is Report => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.companyName === 'string' &&
    (typeof value.generatedAt === 'string' || typeof value.generatedAt === 'number') &&
    Array.isArray(value.transactions) &&
    value.transactions.every(isTransaction)
  );
};

/**
 * Validates a transaction object
 * @param transaction - Transaction to validate
 * @returns Array of error messages, empty if valid
 */
export const validateTransaction = (transaction: Transaction): string[] => {
  const errors: string[] = [];

  if (!transaction.id) {
    errors.push('Transaction ID is required');
  }

  if (!transaction.date) {
    errors.push('Transaction date is required');
  }

  if (transaction.netUsd < 0) {
    errors.push('Net USD cannot be negative');
  }

  if (transaction.receivedPkr < 0) {
    errors.push('Received PKR cannot be negative');
  }

  if (transaction.taxUsd < 0) {
    errors.push('Tax USD cannot be negative');
  }

  return errors;
};

/**
 * Validates a report object
 * @param report - Report to validate
 * @returns Array of error messages, empty if valid
 */
export const validateReport = (report: Report): string[] => {
  const errors: string[] = [];

  if (!report.id) {
    errors.push('Report ID is required');
  }

  if (!report.companyName || report.companyName.trim() === '') {
    errors.push('Company name is required');
  }

  if (!report.generatedAt) {
    errors.push('Generated date is required');
  }

  if (!report.transactions || report.transactions.length === 0) {
    errors.push('Report must contain at least one transaction');
  }

  // Validate each transaction
  report.transactions?.forEach((txn, index) => {
    const txnErrors = validateTransaction(txn);
    if (txnErrors.length > 0) {
      errors.push(`Transaction ${index + 1}: ${txnErrors.join(', ')}`);
    }
  });

  return errors;
};
