/**
 * Formatting utility functions for displaying data
 * All functions are pure and side-effect free
 */

/**
 * Formats a number as currency
 * @param amount - Numeric amount
 * @param currency - Currency code ('USD' or 'PKR')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: 'USD' | 'PKR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'PKR' ? 0 : 2,
    maximumFractionDigits: currency === 'PKR' ? 0 : 2,
  }).format(amount);
};

/**
 * Formats a number as a percentage
 * @param value - Numeric value (0-100 scale)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formats a number with thousand separators
 * @param value - Numeric value
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formats a large number with K/M suffix
 * @param value - Numeric value
 * @returns Formatted compact string (e.g., "1.2K", "3.5M")
 */
export const formatCompact = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(value);
};
