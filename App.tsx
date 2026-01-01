import React, { useState } from 'react';
import CreateReportModal, { CreateReportData } from './components/CreateReportModal';
import Dashboard from './pages/Dashboard';
import ReportDetail from './pages/ReportDetail';
import { Report } from './types';
import { initialReports } from './constants';
import { useReports } from './hooks/useReports';
import { syncWithGoogleSheet } from './services/googleSheetsService';

function App() {
  const { reports, createReport, deleteReport, updateReport, addReport, error } = useReports(initialReports);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateReport = async (data: CreateReportData) => {
    try {
      if (data.mode === 'upload') {
        // File upload mode - create report from file
        if (!data.file) {
          alert('No file provided');
          return;
        }
        
        const newReport = await createReport(data.file, { companyName: data.companyName });
        if (newReport) {
          setIsCreating(false);
          setActiveReport(newReport);
        } else {
          alert(error || 'Failed to create report');
        }
      } else {
        // Google Sheets link mode - fetch data and create report
        if (!data.sheetUrl) {
          alert('No Google Sheets URL provided');
          return;
        }

        // Sync with Google Sheets to get initial data
        const result = await syncWithGoogleSheet(data.sheetUrl);
        
        if (result.success && result.transactions) {
          // Create the report with synced data
          const linkedReport: Report = {
            id: `rep-${Date.now()}`,
            companyName: data.companyName,
            generatedAt: new Date().toISOString(),
            transactions: result.transactions,
            source: 'sheet',
            sheetUrl: data.sheetUrl,
            lastSyncedAt: result.timestamp,
            syncStatus: 'success',
            status: 'Draft'
          };
          
          // Add to reports list
          addReport(linkedReport);
          setIsCreating(false);
          setActiveReport(linkedReport);
        } else {
          alert(`Failed to sync with Google Sheets: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to create report. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteReport = (id: string) => {
    deleteReport(id);
    if (activeReport?.id === id) {
      setActiveReport(null);
    }
  };

  return (
    <div className="min-h-screen pb-10">
      {activeReport ? (
        <ReportDetail 
          report={activeReport} 
          onBack={() => setActiveReport(null)}
          onReportUpdate={(updates) => {
            updateReport(activeReport.id, updates);
            setActiveReport({ ...activeReport, ...updates });
          }}
        />
      ) : (
        <Dashboard 
          reports={reports} 
          onSelectReport={setActiveReport} 
          onCreateReport={() => setIsCreating(true)}
          onDeleteReport={handleDeleteReport}
        />
      )}

      {isCreating && (
        <CreateReportModal
          onClose={() => setIsCreating(false)}
          onCreate={handleCreateReport}
        />
      )}
    </div>
  );
}

export default App;