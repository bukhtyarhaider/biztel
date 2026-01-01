/**
 * useReports Hook
 * Manages report state and operations
 */

import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { Report } from '../types';
import { createReport as createReportService, deleteReport as deleteReportService } from '../services/reportService';
import { ParseOptions } from '../utils/reportParser';

export interface UseReportsReturn {
  reports: Report[];
  isCreating: boolean;
  error: string | null;
  createReport: (file: File, options: ParseOptions) => Promise<Report | null>;
  deleteReport: (id: string) => void;
  setReports: Dispatch<SetStateAction<Report[]>>;
}

/**
 * Custom hook for managing reports
 * @param initialReports - Initial list of reports
 * @returns Report state and operations
 */
export const useReports = (initialReports: Report[] = []): UseReportsReturn => {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReport = useCallback(async (file: File, options: ParseOptions): Promise<Report | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const newReport = await createReportService(file, options);
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report';
      setError(errorMessage);
      console.error('Error creating report:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => deleteReportService(prev, id));
  }, []);

  return {
    reports,
    isCreating,
    error,
    createReport,
    deleteReport,
    setReports
  };
};
