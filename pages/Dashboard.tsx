import React from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, Plus, History, ChevronRight, Trash2 } from 'lucide-react';
import { Report } from '../types';
import { formatCurrency } from '../constants';

interface DashboardProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onCreateReport: () => void;
  onDeleteReport: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  reports, 
  onSelectReport, 
  onCreateReport, 
  onDeleteReport 
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Header onNewReport={onCreateReport} />

      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
        <History className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-bold text-gray-900">Recent Reports</h2>
      </div>

      {reports.length === 0 ? (
        // Empty State
        <Card className="text-center py-20 bg-white border-dashed">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-blue-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No reports generated yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2 mb-8">
            Start tracking your business performance by creating your first financial report.
          </p>
          <Button onClick={onCreateReport} className="gap-2 shadow-lg">
            <Plus className="w-5 h-5" />
            Create your first report
          </Button>
        </Card>
      ) : (
        // Report Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const totalNet = report.transactions.reduce((acc, curr) => acc + curr.netUsd, 0);
            
            return (
              <Card 
                key={report.id} 
                onClick={() => onSelectReport(report)}
                className="hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden bg-white"
              >
                {/* Delete Button */}
                <div className="absolute top-3 right-3 z-20">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         onDeleteReport(report.id);
                      }}
                      className="h-8 w-8 bg-white/80 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Report"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 pr-8">
                    {report.companyName}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    2024-2025 Fiscal Year
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <div>
                      <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Net Revenue</div>
                      <div className="text-xl font-bold text-slate-900">{formatCurrency(totalNet, 'USD')}</div>
                    </div>
                    <div className="flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                      View Details <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
