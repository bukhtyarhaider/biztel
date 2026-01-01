/**
 * Google Sheets Service
 * Handles Google Sheets URL parsing, data fetching, and synchronization
 */

export interface SheetInfo {
  sheetId: string;
  gid?: string;
  url: string;
}

export interface SyncResult {
  success: boolean;
  transactions?: any[];
  error?: string;
  timestamp: string;
}

/**
 * Regular expressions for parsing Google Sheets URLs
 */
const SHEET_URL_PATTERN = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
const GID_PATTERN = /[#&]gid=([0-9]+)/;

/**
 * Validates if a URL is a valid Google Sheets URL
 * @param url - URL to validate
 * @returns True if valid Google Sheets URL
 */
export const validateSheetUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a Google Sheets URL
  return url.includes('docs.google.com/spreadsheets/') && SHEET_URL_PATTERN.test(url);
};

/**
 * Parses a Google Sheets URL to extract sheet ID and GID
 * @param url - Google Sheets URL
 * @returns SheetInfo object with extracted info
 * @throws Error if URL is invalid
 */
export const parseSheetUrl = (url: string): SheetInfo => {
  if (!validateSheetUrl(url)) {
    throw new Error('Invalid Google Sheets URL');
  }

  const sheetIdMatch = url.match(SHEET_URL_PATTERN);
  const gidMatch = url.match(GID_PATTERN);

  if (!sheetIdMatch) {
    throw new Error('Could not extract sheet ID from URL');
  }

  // Convert GID (0-indexed) to tab number (1-indexed) for opensheet
  // If no GID found, default to first tab (1)
  const gid = gidMatch ? String(parseInt(gidMatch[1]) + 1) : '1';

  return {
    sheetId: sheetIdMatch[1],
    gid,
    url
  };
};

/**
 * Constructs an opensheet API URL from sheet info
 * Uses the free opensheet.elk.sh service
 * @param sheetInfo - Sheet information
 * @returns Opensheet API URL
 */
export const getOpensheetUrl = (sheetInfo: SheetInfo): string => {
  const { sheetId, gid } = sheetInfo;
  // Opensheet API format: https://opensheet.elk.sh/SHEET_ID/TAB_NAME_OR_NUMBER
  // For simplicity, we'll use the gid as the tab identifier
  return `https://opensheet.elk.sh/${sheetId}/income-history`;
};

/**
 * Fetches JSON data from a Google Sheet using opensheet API
 * @param sheetInfo - Sheet information
 * @returns Promise resolving to array of row objects
 * @throws Error if fetch fails
 */
export const fetchSheetData = async (sheetInfo: SheetInfo): Promise<any[]> => {
  const opensheetUrl = getOpensheetUrl(sheetInfo);

  try {
    const response = await fetch(opensheetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Sheet not found. Make sure it is published or shared publicly.');
      } else if (response.status === 403 || response.status === 401) {
        throw new Error('Access denied. Please make the sheet public or share with "Anyone with the link".');
      }
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }

    const jsonData = await response.json();
    
    if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('Sheet is empty or data could not be loaded');
    }

    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your internet connection.');
  }
};

/**
 * Syncs a report with its linked Google Sheet
 * @param sheetUrl - Google Sheets URL
 * @returns Promise resolving to sync result
 */
export const syncWithGoogleSheet = async (sheetUrl: string): Promise<SyncResult> => {
  const timestamp = new Date().toISOString();

  try {
    // Parse the URL
    const sheetInfo = parseSheetUrl(sheetUrl);

    // Fetch the JSON data from opensheet
    const jsonData = await fetchSheetData(sheetInfo);

    // Import the parser
    const { parseGoogleSheetsJSON } = await import('../utils/googleSheetsParser');

    // Parse the JSON data into transactions
    const transactions = parseGoogleSheetsJSON(jsonData);

    if (!transactions || transactions.length === 0) {
      throw new Error('No valid transactions found in the sheet');
    }

    return {
      success: true,
      transactions,
      timestamp
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp
    };
  }
};

/**
 * Tests if a Google Sheet is accessible
 * @param url - Google Sheets URL
 * @returns Promise resolving to true if accessible
 */
export const testSheetAccess = async (url: string): Promise<boolean> => {
  try {
    const sheetInfo = parseSheetUrl(url);
    await fetchSheetData(sheetInfo);
    return true;
  } catch {
    return false;
  }
};
