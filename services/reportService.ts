/**
 * Report Service
 * Handles all business logic related to reports
 */

import { Report } from '../types';
import { processFile, ParseOptions } from '../utils/reportParser';

/**
 * Creates a new report from an uploaded file
 * @param file - Excel file to process
 * @param options - Parse options
 * @returns Promise resolving to new Report
 */
export const createReport = async (file: File, options: ParseOptions): Promise<Report> => {
  return await processFile(file, options);
};

/**
 * Validates a report object
 * @param report - Report to validate
 * @returns True if valid, false otherwise
 */
export const validateReport = (report: Report): boolean => {
  if (!report.id || !report.companyName) return false;
  if (!report.transactions || report.transactions.length === 0) return false;
  if (!report.generatedAt) return false;
  return true;
};

/**
 * Deletes a report from the list
 * @param reports - Current list of reports
 * @param reportId - ID of report to delete
 * @returns Updated list of reports
 */
export const deleteReport = (reports: Report[], reportId: string): Report[] => {
  return reports.filter(r => r.id !== reportId);
};

/**
 * Finds a report by ID
 * @param reports - List of reports
 * @param reportId - ID to search for
 * @returns Report if found, undefined otherwise
 */
export const findReportById = (reports: Report[], reportId: string): Report | undefined => {
  return reports.find(r => r.id === reportId);
};

/**
 * Updates a report's status
 * @param reports - Current list of reports
 * @param reportId - ID of report to update
 * @param status - New status
 * @returns Updated list of reports
 */
export const updateReportStatus = (
  reports: Report[],
  reportId: string,
  status: 'Draft' | 'Finalized'
): Report[] => {
  return reports.map(r =>
    r.id === reportId ? { ...r, status } : r
  );
};

/**
 * Sorts reports by generation date (newest first)
 * @param reports - List of reports
 * @returns Sorted list of reports
 */
export const sortReportsByDate = (reports: Report[]): Report[] => {
  return [...reports].sort((a, b) => {
    const dateA = typeof a.generatedAt === 'string' ? new Date(a.generatedAt).getTime() : a.generatedAt;
    const dateB = typeof b.generatedAt === 'string' ? new Date(b.generatedAt).getTime() : b.generatedAt;
    return dateB - dateA;
  });
};
