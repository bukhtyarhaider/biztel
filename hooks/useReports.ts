/**
 * useReports Hook
 * Manages report state and operations with localStorage persistence
 */

import { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { Report } from '../types';
import { createReport as createReportService, deleteReport as deleteReportService } from '../services/reportService';
import { ParseOptions } from '../utils/reportParser';

const STORAGE_KEY = 'intelbiz_reports';

export interface UseReportsReturn {
  reports: Report[];
  isCreating: boolean;
  error: string | null;
  createReport: (file: File, options: ParseOptions) => Promise<Report | null>;
  deleteReport: (id: string) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  addReport: (report: Report) => void;
  setReports: Dispatch<SetStateAction<Report[]>>;
}

/**
 * Custom hook for managing reports with localStorage persistence
 * @param initialReports - Initial list of reports (ignored if localStorage has data)
 * @returns Report state and operations
 */
export const useReports = (initialReports: Report[] = []): UseReportsReturn => {
  // Initialize from localStorage or use initial reports
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📂 Restored', parsed.length, 'reports from localStorage');
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load reports from localStorage:', error);
    }
    return initialReports;
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage whenever reports change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      console.log('💾 Saved', reports.length, 'reports to localStorage');
    } catch (error) {
      console.error('Failed to save reports to localStorage:', error);
    }
  }, [reports]);

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

  const updateReport = useCallback((id: string, updates: Partial<Report>) => {
    setReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, ...updates } : report
      )
    );
  }, []);

  const addReport = useCallback((report: Report) => {
    setReports(prev => [report, ...prev]);
  }, []);

  return {
    reports,
    isCreating,
    error,
    createReport,
    deleteReport,
    updateReport,
    addReport,
    setReports
  };
};
