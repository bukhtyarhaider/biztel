/**
 * Main App Component
 * Handles authentication routing and role-based navigation
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProjects from './pages/admin/Projects';
import AdminUsers from './pages/admin/Users';
import AdminActivity from './pages/admin/Activity';
import ClientDashboard from './pages/client/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ReportDetail from './pages/ReportDetail';
import CreateReportModal, { CreateReportData } from './components/CreateReportModal';
import { Report } from './types';
import { Project, ProjectAccess } from './types/database';
import { useReports } from './hooks/useReports';
import { syncWithGoogleSheet } from './services/googleSheetsService';
import { projectService } from './services/projectService';
import { userService } from './services/userService';
import { LogOut, Shield, User } from 'lucide-react';
import { Button } from './components/ui/Button';

type AuthView = 'login' | 'signup';
type AdminPage = 'dashboard' | 'projects' | 'users' | 'activity';

// Inner app component that uses auth
const AppContent: React.FC = () => {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { reports, createReport, deleteReport, updateReport, addReport, error } = useReports();
  
  // Auth state
  const [authView, setAuthView] = useState<AuthView>('login');
  
  // Navigation state
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({ projectCount: 0, userCount: 0, recentActivity: 0 });
  
  // Client projects
  const [clientProjects, setClientProjects] = useState<(Project & { access: ProjectAccess })[]>([]);

  // Load data based on role
  useEffect(() => {
    if (!user || !profile) return;

    if (isAdmin) {
      // Load admin stats
      userService.getDashboardStats().then(setStats).catch(console.error);
    } else {
      // Load client's assigned projects
      projectService.getForUser(user.id).then(setClientProjects).catch(console.error);
    }
  }, [user, profile, isAdmin]);

  // Handle project creation - now saves to Supabase
  const handleCreateReport = async (data: CreateReportData) => {
    try {
      if (data.mode === 'upload') {
        if (!data.file) {
          alert('No file provided');
          return;
        }
        
        // Parse file and get transactions
        const newReport = await createReport(data.file, { companyName: data.companyName });
        if (newReport) {
          // Also save to Supabase
          try {
            await projectService.create({
              company_name: data.companyName,
              transactions: newReport.transactions,
              created_by: user?.id
            });
            // Refresh stats
            userService.getDashboardStats().then(setStats).catch(console.error);
          } catch (dbError) {
            console.error('Error saving to database:', dbError);
          }
          
          setIsCreating(false);
          setActiveReport(newReport);
        } else {
          alert(error || 'Failed to create report');
        }
      } else {
        if (!data.sheetUrl) {
          alert('No Google Sheets URL provided');
          return;
        }

        const result = await syncWithGoogleSheet(data.sheetUrl);
        
        if (result.success && result.transactions) {
          // Save to Supabase first
          try {
            const dbProject = await projectService.create({
              company_name: data.companyName,
              sheet_url: data.sheetUrl,
              transactions: result.transactions,
              // Only set created_by if we have a user id
              ...(user?.id ? { created_by: user.id } : {})
            });
            
            // Create report object for local view
            const linkedReport: Report = {
              id: dbProject.id, // Use DB id
              companyName: data.companyName,
              generatedAt: new Date().toISOString(),
              transactions: result.transactions,
              source: 'sheet',
              sheetUrl: data.sheetUrl,
              lastSyncedAt: result.timestamp,
              syncStatus: 'success',
              status: 'Draft'
            };
            
            // Refresh stats
            userService.getDashboardStats().then(setStats).catch(console.error);
            
            setIsCreating(false);
            setActiveReport(linkedReport);
          } catch (dbError: any) {
            console.error('Error saving to database:', dbError);
            alert(`Failed to save project: ${dbError?.message || 'Unknown error'}`);
          }
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login/signup
  if (!user) {
    return authView === 'login' 
      ? <Login onSwitchToSignup={() => setAuthView('signup')} />
      : <Signup onSwitchToLogin={() => setAuthView('login')} />;
  }

  // Authenticated - determine dashboard based on role
  const renderNavbar = () => (
    <nav className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-white">IB</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Intelbiz</h1>
            {isAdmin && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            <User className="w-4 h-4" />
            {profile?.full_name || profile?.email}
          </button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );

  // Profile view
  if (showProfile) {
    return (
      <>
        {renderNavbar()}
        <ProfilePage onBack={() => setShowProfile(false)} />
      </>
    );
  }

  // Report detail view
  if (activeReport) {
    return (
      <>
        {renderNavbar()}
        <ReportDetail 
          report={activeReport} 
          onBack={() => setActiveReport(null)}
          onReportUpdate={(updates) => {
            updateReport(activeReport.id, updates);
            setActiveReport({ ...activeReport, ...updates });
          }}
        />
      </>
    );
  }

  // Admin views
  if (isAdmin) {
    const renderAdminPage = () => {
      switch (adminPage) {
        case 'projects':
          return (
            <AdminProjects 
              onBack={() => setAdminPage('dashboard')}
              onSelectProject={(project) => {
                // Convert Project to Report format for viewing
                const report: Report = {
                  id: project.id,
                  companyName: project.company_name,
                  generatedAt: project.created_at,
                  transactions: project.transactions || [],
                  source: project.sheet_url ? 'sheet' : 'upload',
                  sheetUrl: project.sheet_url || undefined,
                  status: 'Finalized'
                };
                setActiveReport(report);
              }}
              onCreateNew={() => setIsCreating(true)}
            />
          );
        case 'users':
          return (
            <AdminUsers onBack={() => setAdminPage('dashboard')} />
          );
        case 'activity':
          return (
            <AdminActivity onBack={() => setAdminPage('dashboard')} />
          );
        case 'dashboard':
        default:
          return (
            <AdminDashboard 
              onNavigate={(page) => setAdminPage(page)}
              stats={stats}
            />
          );
      }
    };

    return (
      <>
        {renderNavbar()}
        {renderAdminPage()}
        {isCreating && (
          <CreateReportModal
            onClose={() => setIsCreating(false)}
            onCreate={handleCreateReport}
          />
        )}
      </>
    );
  }

  // Client view
  return (
    <>
      {renderNavbar()}
      <ClientDashboard 
        projects={clientProjects}
        onSelectProject={(project, access) => {
          // Convert Project to Report format for viewing
          const report: Report = {
            id: project.id,
            companyName: project.company_name,
            generatedAt: project.created_at,
            transactions: project.transactions || [],
            source: project.sheet_url ? 'sheet' : 'upload',
            sheetUrl: project.sheet_url || undefined,
            status: 'Finalized'
          };
          setActiveReport(report);
        }}
      />
    </>
  );
};

// Main App with AuthProvider
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;