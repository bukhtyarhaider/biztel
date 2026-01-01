import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Settings,
  Shield,
  Briefcase
} from 'lucide-react';
import { Project } from '../../types/database';
import { projectService } from '../../services/projectService';
import { createReport } from '../../services/reportService';
import { syncWithGoogleSheet } from '../../services/googleSheetsService';
import { formatCurrency } from '../../constants';
import { EditProjectModal } from '../../components/admin/EditProjectModal';
import { ManageAccessModal } from '../../components/admin/ManageAccessModal';
import CreateReportModal, { CreateReportData } from '../../components/CreateReportModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const AdminProjects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [accessProject, setAccessProject] = useState<Project | null>(null);
  
  // Confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsProcessing(true);
    try {
      await projectService.delete(deleteId);
      setProjects(projects.filter(p => p.id !== deleteId));
      showToast('success', 'Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('error', 'Failed to delete project');
    } finally {
      setIsProcessing(false);
      setDeleteId(null);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectService.update(id, updates);
      setProjects(projects.map(p => p.id === id ? updatedProject : p));
      showToast('success', 'Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      showToast('error', 'Failed to update project');
    }
  };

  const handleCreateReport = async (data: CreateReportData) => {
    try {
      if (data.mode === 'upload') {
        if (!data.file) {
          showToast('error', 'No file provided');
          return;
        }
        
        const newReport = await createReport(data.file, { companyName: data.companyName });
        if (newReport) {
          try {
            const created = await projectService.create({
              company_name: data.companyName,
              transactions: newReport.transactions,
              created_by: user?.id
            });
            setProjects([created, ...projects]);
            showToast('success', 'Portfolio created successfully');
          } catch (dbError) {
            console.error('Error saving to database:', dbError);
            showToast('error', 'Failed to save portfolio to database');
          }
          
          setIsCreating(false);
        } else {
          showToast('error', 'Failed to parse report file');
        }
      } else {
        if (!data.sheetUrl) {
          showToast('error', 'No Google Sheets URL provided');
          return;
        }

        const result = await syncWithGoogleSheet(data.sheetUrl);
        
        if (result.success && result.transactions) {
          try {
            const created = await projectService.create({
              company_name: data.companyName,
              sheet_url: data.sheetUrl,
              transactions: result.transactions,
              created_by: user?.id
            });
            
            setProjects([created, ...projects]);
            showToast('success', 'Portfolio linked and created successfully');
            setIsCreating(false);
          } catch (dbError: any) {
            console.error('Error saving to database:', dbError);
            showToast('error', `Failed to save portfolio: ${dbError?.message || 'Unknown error'}`);
          }
        } else {
          showToast('error', `Failed to sync with Google Sheets: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error creating report:', error);
      showToast('error', 'Failed to create report. Please try again.');
    }
  };

  const calculateTotalNet = (transactions: any[]) => {
    return transactions?.reduce((sum, t) => sum + (t.netUsd || 0), 0) || 0;
  };

  const filteredProjects = projects.filter(p => 
    p.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Portfolio Registry</h1>
          <p className="text-muted-foreground text-sm font-light">{projects.length} Total Portfolios</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Portfolio
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by company name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent/50 transition-all font-mono text-sm"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4 text-sm font-mono tracking-widest">LOADING ASSETS...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card text-center py-20 border border-dashed border-white/10">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white">No portfolios found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {searchQuery ? 'Try a different search term' : 'Create your first investment portfolio to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/report/${project.id}`}
              className="block group relative"
            >
              <div className="glass-card rounded-xl border border-white/5 hover:border-accent/50 transition-all h-full overflow-hidden">
                {/* Actions - Prevent Link navigation when clicking buttons */}
                <div className="absolute top-3 right-3 z-20 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/80 p-1 rounded-lg backdrop-blur-md border border-white/10">
                   <Button
                    variant="ghost"
                    size="icon"
                    title="Manage Access"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAccessProject(project);
                    }}
                    className="h-7 w-7 hover:bg-white/10 hover:text-white text-muted-foreground"
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit Project"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingProject(project);
                    }}
                    className="h-7 w-7 hover:bg-white/10 hover:text-white text-muted-foreground"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </Button>

                  <div className="w-px h-3 bg-white/10 my-auto mx-1" />

                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete Project"
                    onClick={(e) => confirmDelete(project.id, e)}
                    className="h-7 w-7 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="p-6 relative z-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-white/5 text-white rounded-lg border border-white/10">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate group-hover:text-accent transition-colors">
                        {project.company_name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {project.transactions?.length || 0} RECORDS
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Net Yield</p>
                      <p className="text-lg font-bold text-accent font-mono">
                        {formatCurrency(calculateTotalNet(project.transactions), 'USD')}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-full bg-white/5 text-muted-foreground group-hover:bg-accent group-hover:text-black transition-all duration-300">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modals */}
      {isCreating && (
        <CreateReportModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onCreate={handleCreateReport}
        />
      )}

      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onSave={handleUpdate}
      />

      <ManageAccessModal
        isOpen={!!accessProject}
        onClose={() => setAccessProject(null)}
        project={accessProject}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this portfolio? This action cannot be undone and will remove all associated transaction data."
        confirmText="Delete Portfolio"
        variant="danger"
        loading={isProcessing}
      />
    </div>
  );
};

export default AdminProjects;
