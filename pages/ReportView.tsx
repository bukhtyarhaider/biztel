import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectLoader } from '../components/ui/ProjectLoader';
import ReportDetail from './ReportDetail';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { Report } from '../types';
import { Project, ProjectAccess } from '../types/database';
import { FileWarning, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

const ReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadProject(id);
    }
  }, [id, user]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    setAccessDenied(false);
    
    try {
      const project = await projectService.getById(projectId);
      
      if (!project) {
        setLoading(false);
        return;
      }

      // STRICT ACCESS CHECK
      let hasAccess = false;
      let userCanDownload = false;

      if (isAdmin) {
        hasAccess = true;
        userCanDownload = true;
      } else if (user) {
        // Find access record for current user
        const userAccess = project.project_access?.find(
          (a: ProjectAccess) => a.user_id === user.id
        );

        if (userAccess && userAccess.can_view) {
          hasAccess = true;
          userCanDownload = userAccess.can_download;
        }
      }

      if (!hasAccess) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const reportData: Report = {
        id: project.id,
        companyName: project.company_name,
        generatedAt: project.created_at,
        transactions: project.transactions || [],
        source: project.sheet_url ? 'sheet' : 'upload',
        sheetUrl: project.sheet_url || undefined,
        status: 'Finalized',
        autoSync: false,
        syncInterval: 0
      };
      
      setReport(reportData);
      setCanDownload(userCanDownload);

    } catch (error) {
       console.error('Error loading project:', error);
    } finally {
       setLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<Report>) => {
    if (!report) return;
    
    try {
      const projectUpdates: Partial<Project> = {};
      if (updates.transactions) projectUpdates.transactions = updates.transactions;
      if (updates.companyName) projectUpdates.company_name = updates.companyName;

      if (Object.keys(projectUpdates).length > 0) {
          await projectService.update(report.id, projectUpdates);
      }
      
      setReport({ ...report, ...updates });
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to save changes');
    }
  };

  if (loading) {
    return <ProjectLoader />;
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg border border-red-100">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-red-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
             <p className="text-slate-600 mb-6">
               You do not have permission to view this project. If you believe this is an error, please contact your administrator.
             </p>
             <Button onClick={() => navigate('/')} className="w-full">
               Return Home
             </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileWarning className="w-8 h-8 text-slate-400" />
             </div>
             <h2 className="text-xl font-bold text-slate-900">Project Not Found</h2>
             <p className="text-slate-500 mt-2 mb-6">The project you are looking for does not exist or has been removed.</p>
             <button onClick={() => navigate('/')} className="text-blue-600 hover:underline font-medium">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <ReportDetail
       report={report}
       onBack={() => navigate(-1)}
       onReportUpdate={handleUpdate}
       canDownload={canDownload}
       isAdmin={isAdmin}
    />
  );
};

export default ReportView;
