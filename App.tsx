import React, { useState, useEffect } from 'react';
import CreateReportModal, { CompanyInfo } from './components/CreateReportModal';
import Dashboard from './pages/Dashboard';
import ReportDetail from './pages/ReportDetail';
import { Transaction, Report } from './types';
import { initialReports } from './constants';
import { processFile } from './utils/reportParser';

function App() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  //const [filter, setFilter] = useState('All'); // Moved to Dashboard if needed, or remove if unused
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // File processing function 
  // Moved to utils/reportParser.ts

  const handleCreateReport = async (file: File, companyInfo: CompanyInfo) => {
    try {
      const newReport = await processFile(file, { companyName: companyInfo.name });
      setReports([newReport as Report, ...reports]);
      setIsCreating(false);
      setActiveReport(newReport as Report);
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Failed to parse the file. Please ensure it's a valid Excel file.");
    }
  };

  const handleDeleteReport = (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
        setReports(reports.filter(r => r.id !== id));
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