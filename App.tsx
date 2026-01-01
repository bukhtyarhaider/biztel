import React, { useState } from 'react';
import CreateReportModal, { CompanyInfo } from './components/CreateReportModal';
import Dashboard from './pages/Dashboard';
import ReportDetail from './pages/ReportDetail';
import { Report } from './types';
import { initialReports } from './constants';
import { useReports } from './hooks/useReports';

function App() {
  const { reports, createReport, deleteReport, error } = useReports(initialReports);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateReport = async (file: File, companyInfo: CompanyInfo) => {
    const newReport = await createReport(file, { companyName: companyInfo.name });
    
    if (newReport) {
      setIsCreating(false);
      setActiveReport(newReport);
    } else {
      // Error is already logged by the hook
      alert(error || "Failed to parse the file. Please ensure it's a valid Excel file.");
    }
  };

  const handleDeleteReport = (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteReport(id);
      if (activeReport?.id === id) {
        setActiveReport(null);
      }
    }
  };

  return (
    <div className="min-h-screen pb-10">
      {activeReport ? (
        <ReportDetail 
          report={activeReport} 
          onBack={() => setActiveReport(null)} 
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