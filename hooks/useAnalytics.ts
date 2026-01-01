/**
 * useAnalytics Hook
 * Provides computed analytics for transactions
 */

import { useMemo } from 'react';
import { Transaction } from '../types';
import {
  calculateTotalNet,
  calculateRevenueByStatus,
  calculateTotalPKR,
  calculateTotalTax
} from '../services/transactionService';

export interface ReportMetrics {
  totalRevenue: number;
  pendingRevenue: number;
  receivedRevenue: number;
  receivedPKR: number;
  totalTax: number;
}

/**
 * Custom hook for computing analytics from transactions
 * Memoizes expensive calculations
 * @param transactions - Array of transactions
 * @returns Computed metrics
 */
export const useAnalytics = (transactions: Transaction[]): ReportMetrics => {
  return useMemo(() => {
    const totalRevenue = calculateTotalNet(transactions);
    const pendingRevenue = calculateRevenueByStatus(transactions, 'Pending') +
                          calculateRevenueByStatus(transactions, 'Expected');
    const receivedRevenue = calculateRevenueByStatus(transactions, 'Received');
    const receivedPKR = calculateTotalPKR(transactions, 'Received');
    const totalTax = calculateTotalTax(transactions);

    return {
      totalRevenue,
      pendingRevenue,
      receivedRevenue,
      receivedPKR,
      totalTax
    };
  }, [transactions]);
};
