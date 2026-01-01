import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  ArrowLeft,
  User,
  Mail,
  Shield,
  Save,
  FolderKanban,
  Check,
  Download,
  Eye,
  Calendar,
  Fingerprint,
  Terminal,
  Activity,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Project, ProjectAccess } from '../types/database';
import { projectService } from '../services/projectService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<(Project & { access: ProjectAccess })[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user && !isAdmin) {
      projectService.getForUser(user.id)
        .then(setProjects)
        .catch(console.error)
        .finally(() => setLoadingProjects(false));
    } else {
      setLoadingProjects(false);
    }
  }, [user, isAdmin]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      showToast('success', 'Profile identity updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Failed to update identity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Identity Management</h1>
          <p className="text-muted-foreground text-sm font-mono tracking-wide">
            OPERATOR: <span className="text-accent">{profile?.email?.toUpperCase()}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <Fingerprint className="w-24 h-24 text-white/5 -rotate-12 transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            
            <div className="relative z-10">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold font-mono mb-6 shadow-lg ${
                isAdmin ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'bg-blue-500/20 text-blue-500 border border-blue-500/20'
              }`}>
                {(profile?.full_name || profile?.email || '?').charAt(0).toUpperCase()}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">
                {profile?.full_name || 'Anonymous User'}
              </h2>
              <p className="text-sm text-muted-foreground font-mono mb-6 truncate">
                {profile?.email}
              </p>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Clearance</span>
                  <span className={`text-xs px-2 py-1 rounded font-mono border ${
                    isAdmin 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                      : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {isAdmin ? 'LEVEL 10 (ADMIN)' : 'LEVEL 1 (INVESTOR)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
                  <span className="text-xs px-2 py-1 rounded font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Since</span>
                  <span className="text-xs text-white font-mono">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Protocols
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <div className="text-sm">
                    <p className="text-white font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">Secure access credential</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="h-7 text-xs text-muted-foreground hover:text-white"
                >
                  UPDATE
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-4 h-4 text-slate-500" />
                  <div className="text-sm">
                    <p className="text-white font-medium">2FA</p>
                    <p className="text-xs text-muted-foreground">Not configured</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-white" disabled>
                  SETUP
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settings Section */}
          <div className="glass-card p-8 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Profile Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent font-mono transition-colors"
                  placeholder="ENTER FULL NAME"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Primary Email</label>
                <div className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 text-muted-foreground font-mono flex items-center justify-between cursor-not-allowed">
                  <span>{profile?.email}</span>
                  <Lock className="w-3 h-3 opacity-50" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                  CONTACT SYSTEM ADMINISTRATOR TO UPDATE EMAIL ADDRESS
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || fullName === profile?.full_name}
                  className="bg-accent hover:bg-accent/90 text-black font-bold h-11 px-6 gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'SAVING CHANGES...' : 'SAVE CONFIGURATION'}
                </Button>
              </div>
            </div>
          </div>

          {/* Access / Admin Section */}
          {isAdmin ? (
            <div className="glass-card p-8 rounded-xl border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Administrative Capabilities</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                   <FolderKanban className="w-5 h-5 text-emerald-500 mb-3" />
                   <h3 className="text-sm font-bold text-white mb-1">Portfolio Control</h3>
                   <p className="text-xs text-muted-foreground">Create, edit, and delete investment portfolios.</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                   <User className="w-5 h-5 text-blue-500 mb-3" />
                   <h3 className="text-sm font-bold text-white mb-1">User Management</h3>
                   <p className="text-xs text-muted-foreground">Manage user roles and system access.</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                   <Activity className="w-5 h-5 text-purple-500 mb-3" />
                   <h3 className="text-sm font-bold text-white mb-1">Audit Logs</h3>
                   <p className="text-xs text-muted-foreground">Full visibility into system events and actions.</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                   <Shield className="w-5 h-5 text-amber-500 mb-3" />
                   <h3 className="text-sm font-bold text-white mb-1">System Security</h3>
                   <p className="text-xs text-muted-foreground">Configure global security settings.</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-xl border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <FolderKanban className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Authorized Portfolios</h2>
              </div>

              {loadingProjects ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 text-accent animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-4 text-xs font-mono">RETRIEVING ACCESS LIST...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
                  <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-white font-medium">No portfolios assigned</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">CONTACT ADMIN FOR ACCESS</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                          <FolderKanban className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm group-hover:text-accent transition-colors">{project.company_name}</h3>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            ID: {project.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {project.access.can_view && (
                          <div className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-mono font-bold">
                            <Eye className="w-3 h-3" />
                            VIEW
                          </div>
                        )}
                        {project.access.can_download && (
                          <div className="flex items-center gap-1.5 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded font-mono font-bold">
                            <Download className="w-3 h-3" />
                            EXPORT
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
