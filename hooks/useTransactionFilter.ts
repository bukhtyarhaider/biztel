/**
 * useTransactionFilter Hook
 * Manages transaction filtering and sorting logic
 */

import { useState, useMemo } from 'react';
import { Transaction } from '../types';
import {
  filterTransactions,
  sortTransactions,
  SortKey,
  SortDirection,
  SortConfig
} from '../services/transactionService';

export interface UseTransactionFilterReturn {
  filter: string;
  setFilter: (filter: string) => void;
  sortConfig: SortConfig;
  handleSort: (key: SortKey) => void;
  filteredData: Transaction[];
  sortedData: Transaction[];
}

/**
 * Custom hook for filtering and sorting transactions
 * @param transactions - Array of transactions to filter/sort
 * @param initialSortKey - Initial sort key (default: 'earningMonth')
 * @param initialSortDirection - Initial sort direction (default: 'asc')
 * @returns Filter/sort state and operations
 */
export const useTransactionFilter = (
  transactions: Transaction[],
  initialSortKey: SortKey = 'earningMonth',
  initialSortDirection: SortDirection = 'asc'
): UseTransactionFilterReturn => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: initialSortKey,
    direction: initialSortDirection
  });

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return filterTransactions(transactions, filter);
  }, [transactions, filter]);

  // Memoize sorted data
  const sortedData = useMemo(() => {
    return sortTransactions(filteredData, sortConfig);
  }, [filteredData, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return {
    filter,
    setFilter,
    sortConfig,
    handleSort,
    filteredData,
    sortedData
  };
};
