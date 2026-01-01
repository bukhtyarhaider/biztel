import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Search, 
  Building2, 
  Users, 
  Trash2, 
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Settings,
  Shield // Changed from Users to avoid confusion
} from 'lucide-react';
import { Project } from '../../types/database';
import { projectService } from '../../services/projectService';
import { formatCurrency } from '../../constants';
import { EditProjectModal } from '../../components/admin/EditProjectModal';
import { ManageAccessModal } from '../../components/admin/ManageAccessModal';

interface AdminProjectsProps {
  onBack: () => void;
  onSelectProject: (project: Project) => void;
  onCreateNew: () => void;
}

const AdminProjects: React.FC<AdminProjectsProps> = ({ onBack, onSelectProject, onCreateNew }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [accessProject, setAccessProject] = useState<Project | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectService.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectService.update(id, updates);
      setProjects(projects.map(p => p.id === id ? updatedProject : p));
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };

  const calculateTotalNet = (transactions: any[]) => {
    return transactions?.reduce((sum, t) => sum + (t.netUsd || 0), 0) || 0;
  };

  const filteredProjects = projects.filter(p => 
    p.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500">{projects.length} total projects</p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-5 h-5" />
          New Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-slate-500 mt-4">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-12">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
          <p className="text-slate-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="hover:shadow-lg transition-all cursor-pointer group relative"
            >
              {/* Actions */}
              <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg backdrop-blur-sm border border-slate-100 shadow-sm">
                 <Button
                  variant="ghost"
                  size="icon"
                  title="Manage Access"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccessProject(project);
                  }}
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Shield className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  title="Edit Project"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(project);
                  }}
                  className="h-8 w-8 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                <div className="w-px h-4 bg-slate-200 my-auto mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete Project"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project.id);
                  }}
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors pr-16 bg-white">
                      {project.company_name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {project.transactions?.length || 0} transactions
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Net Revenue</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(calculateTotalNet(project.transactions), 'USD')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                    <span className="text-sm">View Report</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
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
    </div>
  );
};

export default AdminProjects;
