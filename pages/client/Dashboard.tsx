import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Building2, ChevronRight, Lock, TrendingUp } from 'lucide-react';
import { Project, ProjectAccess } from '../../types/database';
import { formatCurrency } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
import { Link } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<(Project & { access: ProjectAccess })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await projectService.getForUser(user.id);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalNet = (transactions: any[]) => {
    return transactions?.reduce((sum, t) => sum + (t.netUsd || 0), 0) || 0;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Asset Portfolio</h1>
          <p className="text-muted-foreground mt-1 text-sm font-light">Manage your assigned investment vehicles.</p>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Assets</p>
            <p className="text-xl font-bold text-white font-mono">{projects.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : projects.length === 0 ? (
        // Empty State
        <div className="glass-card py-20 text-center border border-dashed border-white/10 rounded-xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-white">No Assets Assigned</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
            Contact your portfolio manager to get access to investment reports.
          </p>
        </div>
      ) : (
        // Project Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const totalNet = calculateTotalNet(project.transactions);
            const access = project.access;
            
            return (
              <Link 
                key={project.id} 
                to={`/report/${project.id}`}
                className="block group relative"
              >
                <div 
                  className="glass-card rounded-xl p-6 h-full border border-white/5 hover:border-accent/40 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-3 bg-white/5 text-white rounded-lg border border-white/5 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex gap-2">
                        {access.can_download && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                EXPORT
                            </span>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded border border-white/10">
                             {access.can_edit ? 'MANAGE' : 'VIEW'}
                        </span>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors line-clamp-1">
                        {project.company_name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Portfolio
                    </p>
                    
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                        <div className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">Net Yield (YTD)</div>
                        <div className="text-xl font-bold text-accent font-mono">{formatCurrency(totalNet, 'USD')}</div>
                        </div>
                        <div className="p-2 rounded-full bg-white/5 text-white opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                             <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
