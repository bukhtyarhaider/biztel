/**
 * Client Dashboard
 * Shows only assigned projects to the client
 */

import React from 'react';
import { Card } from '../../components/ui/Card';
import { Building2, ChevronRight, Lock } from 'lucide-react';
import { Project, ProjectAccess } from '../../types/database';
import { formatCurrency } from '../../constants';

interface ClientDashboardProps {
  projects: (Project & { access: ProjectAccess })[];
  onSelectProject: (project: Project, access: ProjectAccess) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ projects, onSelectProject }) => {
  const calculateTotalNet = (transactions: any[]) => {
    return transactions?.reduce((sum, t) => sum + (t.netUsd || 0), 0) || 0;
  };

  const getDateRange = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) return 'No Data';
    
    const timestamps = transactions
      .map(t => new Date(t.earningMonth || t.releaseDate || t.date).getTime())
      .filter(ts => ts > 0 && !isNaN(ts));

    if (timestamps.length === 0) return 'No Date Range';

    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    const startMonth = minDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endMonth = maxDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
        <p className="text-slate-500 mt-1">View your assigned financial projects</p>
      </div>

      {projects.length === 0 ? (
        // Empty State
        <Card className="text-center py-20 bg-white border-dashed">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Projects Assigned</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            You don't have access to any projects yet. Please contact your administrator.
          </p>
        </Card>
      ) : (
        // Project Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const totalNet = calculateTotalNet(project.transactions);
            const dateRange = getDateRange(project.transactions);
            
            return (
              <Card 
                key={project.id} 
                onClick={() => onSelectProject(project, project.access)}
                className="hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden bg-white"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      {project.access.can_download && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Download
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                        View Only
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {project.company_name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {dateRange}
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

export default ClientDashboard;
