/**
 * useSheetSync Hook
 * Manages Google Sheets synchronization for reports
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Report, Transaction } from '../types';
import { syncWithGoogleSheet, parseSheetUrl } from '../services/googleSheetsService';

export interface UseSheetSyncReturn {
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncedAt: string | undefined;
  syncError: string | undefined;
  isLoading: boolean;
  syncReport: () => Promise<Transaction[] | null>;
  linkSheet: (url: string) => Promise<boolean>;
}

/**
 * Custom hook for managing Google Sheets sync
 * @param report - Report to sync
 * @param onUpdate - Callback when report should be updated
 * @returns Sync state and methods
 */
export const useSheetSync = (
  report: Report,
  onUpdate: (updatedReport: Partial<Report>) => void
): UseSheetSyncReturn => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>(
    report.syncStatus || 'idle'
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(report.lastSyncedAt);
  const [syncError, setSyncError] = useState<string | undefined>(report.syncError);
  const [isLoading, setIsLoading] = useState(false);
  const autoSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Links a Google Sheet to the report
   * @param url - Google Sheets URL
   * @returns Promise resolving to true if successful
   */
  const linkSheet = useCallback(async (url: string): Promise<boolean> => {
    try {
      const sheetInfo = parseSheetUrl(url);
      
      onUpdate({
        sheetUrl: url,
        sheetId: sheetInfo.sheetId,
        sheetGid: sheetInfo.gid,
        syncStatus: 'idle'
      });

      return true;
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Failed to link sheet');
      return false;
    }
  }, [onUpdate]);

  /**
   * Syncs the report with its linked Google Sheet
   * @returns Promise resolving to updated transactions or null if failed
   */
  const syncReport = useCallback(async (): Promise<Transaction[]  | null> => {
    if (!report.sheetUrl) {
      setSyncError('No Google Sheet linked to this report');
      return null;
    }

    setSyncStatus('syncing');
    setIsLoading(true);
    setSyncError(undefined);

    try {
      const result = await syncWithGoogleSheet(report.sheetUrl);

      if (result.success && result.transactions) {
        setSyncStatus('success');
        setLastSyncedAt(result.timestamp);
        setSyncError(undefined);

        // Update report with new data
        onUpdate({
          transactions: result.transactions,
          lastSyncedAt: result.timestamp,
          syncStatus: 'success',
          syncError: undefined
        });

        return result.transactions;
      } else {
        setSyncStatus('error');
        setSyncError(result.error || 'Sync failed');
        
        onUpdate({
          syncStatus: 'error',
          syncError: result.error
        });

        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSyncStatus('error');
      setSyncError(errorMessage);

      onUpdate({
        syncStatus: 'error',
        syncError: errorMessage
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [report.sheetUrl, onUpdate]);

  /**
   * Setup auto-sync if enabled
   */
  useEffect(() => {
    // Clear any existing interval
    if (autoSyncIntervalRef.current) {
      clearInterval(autoSyncIntervalRef.current);
      autoSyncIntervalRef.current = null;
    }

    // Setup new interval if auto-sync is enabled
    if (report.autoSync && report.sheetUrl) {
      const intervalMinutes = report.syncInterval || 30;
      const intervalMs = intervalMinutes * 60 * 1000;

      autoSyncIntervalRef.current = setInterval(() => {
        syncReport();
      }, intervalMs);

      return () => {
        if (autoSyncIntervalRef.current) {
          clearInterval(autoSyncIntervalRef.current);
        }
      };
    }
  }, [report.autoSync, report.syncInterval, report.sheetUrl, syncReport]);

  return {
    syncStatus,
    lastSyncedAt,
    syncError,
    isLoading,
    syncReport,
    linkSheet
  };
};
