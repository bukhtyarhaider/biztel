import * as XLSX from 'xlsx';
import { Transaction, Report } from '../types';

export interface ParseOptions {
  companyName: string;
}

export const processFile = async (file: File, options: ParseOptions): Promise<Report> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        let transactions: Transaction[] = [];

        // Helper functions
        const parseExcelDate = (val: any) => {
            if (typeof val === 'number') {
                const dateObj = new Date((val - 25569) * 86400 * 1000);
                return !isNaN(dateObj.getTime()) ? dateObj.toISOString() : new Date().toISOString();
            }
            return new Date().toISOString();
        };

        const toTitleCase = (str: string) => str ? str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase() : '';

        const getNumber = (val: any) => {
            if (typeof val === 'number' && !isNaN(val)) return val;
            return 0;
        };

        if (workbook.SheetNames.includes('Income')) {
            // Specific logic for "Income" sheet
            const sheet = workbook.Sheets['Income'];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            
            // Data starts from index 3 (Row 4 in Excel) based on inspection
            const dataRows = jsonData.slice(3);

            transactions = dataRows.filter(row => row && row.length > 0 && row[1]).map((row, index) => {
                const releaseDate = parseExcelDate(row[1]);
                
                // Helper to proper case
                const toTitleCase = (str: string) => str ? str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase() : '';

                const getNumber = (val: any) => {
                    if (typeof val === 'number' && !isNaN(val)) return val;
                    return 0;
                };

                // Parse earning month from the Month column (row[0])
                const parseEarningMonth = (monthStr: any) => {
                    if (!monthStr) return releaseDate;
                    
                    // Month is like "April", "May", etc.
                    // We need to convert it to a date. Use the release year or current year
                    const releaseYear = new Date(releaseDate).getFullYear();
                    const monthName = String(monthStr).trim();
                    
                    // Create a date from month name and year
                    const monthDate = new Date(`${monthName} 1, ${releaseYear}`);
                    if (!isNaN(monthDate.getTime())) {
                        return monthDate.toISOString();
                    }
                    return releaseDate;
                };

                return {
                    id: `txn-${Date.now()}-${index}`,
                    date: releaseDate, 
                    earningMonth: parseEarningMonth(row[0]),
                    releaseDate: releaseDate,
                    receivedDate: row[2] ? parseExcelDate(row[2]) : null,
                    durationDays: getNumber(row[3]),
                    platform: row[4] ? toTitleCase(String(row[4])) as 'Youtube' | 'Tiktok' : undefined,
                    method: row[5] ? String(row[5]) : undefined,
                    rate: getNumber(row[6]),
                    expectedUsd: getNumber(row[7]), 
                    expectedPkr: getNumber(row[8]), 
                    receivedPkr: getNumber(row[14]),
                    taxUsd: getNumber(row[10]),
                    taxPkr: getNumber(row[11]),
                    taxPercent: getNumber(row[12]) * 100, 
                    netUsd: getNumber(row[13]), 
                    netPkr: getNumber(row[14]),
                    status: row[15] ? toTitleCase(String(row[15])) : 'Semifinal',
                    // Legacy/Fallback for UI
                    description: `Income from ${row[4] || 'Unknown'}`,
                    amount: getNumber(row[7]),
                    type: 'Credit',
                    category: 'Income'
                } as Transaction;
            });

        } else {
           // Fallback to generic simple sheet parsing
           const sheetName = workbook.SheetNames[0];
           const sheet = workbook.Sheets[sheetName];
           const jsonData = XLSX.utils.sheet_to_json(sheet);
           
            transactions = jsonData.map((row: any, index: number) => {
              let dateStr = new Date().toISOString(); 
              if (row.Date) {
                  if (typeof row.Date === 'number') {
                      const dateObj = new Date((row.Date - (25569)) * 86400 * 1000);
                      if (!isNaN(dateObj.getTime())) {
                         dateStr = dateObj.toISOString();
                      }
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
                 amount: Number(row.Amount || 0),
                 type: (row.Debit || row.Withdrawal) ? 'Debit' : 'Credit',
                 category: row.Category || 'General',
                 status: row.Status || 'Completed',
                 receivedPkr: Number(row['Received PKR'] || row.Amount || 0),
                 bankCharges: Number(row['Bank Charges'] || 0),
                 taxUsd: Number(row['Tax USD'] || 0),
                 netUsd: Number(row['Net USD'] || row.Amount || 0), 
              } as Transaction;
           });
        }

        // Create new report
        const newReport: Report = {
          id: `rep-${Date.now()}`,
          companyName: options.companyName,
          generatedAt: new Date().toISOString(),
          transactions: transactions,
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
