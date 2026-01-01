/**
 * Central type exports
 * Re-exports all types from the main types file and adds utility types
 */

export * from '../types';

// Utility types for better type safety
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Status types for better type safety
export type TransactionStatus = 'Received' | 'Pending' | 'Expected' | 'Semifinal';
export type ReportStatus = 'Draft' | 'Finalized';

// Platform types
export type Platform = 'Youtube' | 'Tiktok';

// Currency types
export type Currency = 'USD' | 'PKR';
