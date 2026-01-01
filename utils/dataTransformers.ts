/**
 * Data transformation utility functions
 * All functions are pure and side-effect free
 */

/**
 * Converts a string to title case (first letter uppercase, rest lowercase)
 * @param str - Input string
 * @returns Title-cased string
 */
export const toTitleCase = (str: string): string => {
  return str ? str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase() : '';
};

/**
 * Safely converts any value to a number, returning 0 for invalid values
 * @param val - Value to convert
 * @returns Numeric value or 0
 */
export const getNumber = (val: any): number => {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

/**
 * Safely gets a string value, with fallback
 * @param val - Value to convert
 * @param fallback - Fallback value if conversion fails
 * @returns String value
 */
export const getString = (val: any, fallback: string = ''): string => {
  if (val === null || val === undefined) return fallback;
  return String(val);
};

/**
 * Normalizes platform name to standard format
 * @param platform - Platform string from data source
 * @returns Normalized platform name
 */
export const normalizePlatform = (platform: any): 'Youtube' | 'Tiktok' | undefined => {
  if (!platform) return undefined;
  
  const normalized = toTitleCase(String(platform));
  if (normalized === 'Youtube' || normalized === 'Tiktok') {
    return normalized as 'Youtube' | 'Tiktok';
  }
  
  return undefined;
};

/**
 * Cleans and normalizes a numeric percentage value
 * Converts decimal to percentage (0.15 -> 15)
 * @param val - Percentage value
 * @returns Normalized percentage
 */
export const normalizePercentage = (val: any): number => {
  const num = getNumber(val);
  // If the value is between 0 and 1, assume it's a decimal percentage
  if (num > 0 && num < 1) {
    return num * 100;
  }
  return num;
};
