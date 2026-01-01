/**
 * Date utility functions for parsing and formatting dates
 * All functions are pure and side-effect free
 */

/**
 * Converts Excel serial date number to ISO string
 * Excel dates are stored as numbers representing days since 1900-01-01
 * @param val - Excel date value (number or other)
 * @returns ISO date string
 */
export const parseExcelDate = (val: any): string => {
  if (typeof val === 'number') {
    const dateObj = new Date((val - 25569) * 86400 * 1000);
    return !isNaN(dateObj.getTime()) ? dateObj.toISOString() : new Date().toISOString();
  }
  return new Date().toISOString();
};

/**
 * Parses earning month from various formats
 * @param monthStr - Month string (e.g., "April", "May")
 * @param referenceDate - Reference date for year calculation
 * @returns ISO date string set to first day of the month
 */
export const parseEarningMonth = (monthStr: any, referenceDate: string): string => {
  if (!monthStr) return referenceDate;
  
  // Month is like "April", "May", etc.
  // We need to convert it to a date. Use the release year or current year
  const releaseYear = new Date(referenceDate).getFullYear();
  const monthName = String(monthStr).trim();
  
  // Create a date from month name and year
  const monthDate = new Date(`${monthName} 1, ${releaseYear}`);
  if (!isNaN(monthDate.getTime())) {
    return monthDate.toISOString();
  }
  return referenceDate;
};

/**
 * Formats a date value to ISO string, handling multiple input formats
 * @param dateValue - Date as number, string, or Date object
 * @returns ISO date string
 */
export const formatToISODate = (dateValue: number | string | Date): string => {
  if (typeof dateValue === 'number') {
    const dateObj = new Date((dateValue - 25569) * 86400 * 1000);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString();
    }
  } else if (dateValue instanceof Date) {
    return dateValue.toISOString();
  } else if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  
  return new Date().toISOString();
};

/**
 * Formats a date for display
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', options);
};
