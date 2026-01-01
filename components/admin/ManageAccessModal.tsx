import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Project, Profile, ProjectAccess } from '@/types/database';
import { projectService } from '@/services/projectService';
import { userService } from '@/services/userService';
import { RefreshCw, Search, Trash2, Plus, AlertCircle, Shield, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ManageAccessModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManageAccessModal: React.FC<ManageAccessModalProps> = ({ 
  project, 
  isOpen, 
  onClose 
}) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentAccess, setCurrentAccess] = useState<ProjectAccess[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && project) {
      loadData();
    }
  }, [isOpen, project]);

  const loadData = async () => {
    if (!project) return;
    setLoading(true);
    try {
      const [allUsers, accessList] = await Promise.all([
        userService.getAll(),
        projectService.getProjectUsers(project.id)
      ]);
      setUsers(allUsers);
      setCurrentAccess(accessList);
    } catch (error) {
      console.error('Error loading access data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (userId: string) => {
    if (!project) return;
    setProcessingId(`grant-${userId}`);
    try {
      const newAccess = await projectService.assignUser(project.id, userId, { 
        can_view: true, 
        can_download: false 
      });
      setCurrentAccess(prev => [...prev, newAccess]);
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Failed to grant access');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveAccess = async (userId: string) => {
    if (!project) return;
    setProcessingId(`remove-${userId}`);
    try {
      await projectService.removeUser(project.id, userId);
      setCurrentAccess(prev => prev.filter(a => a.user_id !== userId));
    } catch (error) {
      console.error('Error removing access:', error);
      alert('Failed to remove access');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdatePermission = async (userId: string, permission: 'can_view' | 'can_download', value: boolean) => {
    if (!project) return;
    
    const previousAccess = currentAccess;
    const targetAccess = currentAccess.find(a => a.user_id === userId);
    if (!targetAccess) return;

    const updatedPermissions = {
      can_view: targetAccess.can_view,
      can_download: targetAccess.can_download,
      [permission]: value
    };

    if (permission === 'can_download' && value === true) {
      updatedPermissions.can_view = true;
    }

    setCurrentAccess(prev => prev.map(a => 
      a.user_id === userId ? { ...a, ...updatedPermissions } : a
    ));

    try {
      await projectService.assignUser(project.id, userId, updatedPermissions);
    } catch (error) {
      console.error('Error updating permissions:', error);
      setCurrentAccess(previousAccess);
      alert('Failed to update permission');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAccessForUser = (userId: string) => {
    return currentAccess.find(a => a.user_id === userId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ACCESS CONTROL"
      description={project ? `MANAGE INVESTOR PERMISSIONS FOR ${project.company_name.toUpperCase()}` : undefined}
      className="max-w-2xl bg-[#0B0F19] border-white/10"
    >
      <div className="space-y-6 mt-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH INVESTORS..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-accent font-mono text-sm"
          />
        </div>

        {/* User List */}
        <div className="max-h-[400px] overflow-y-auto space-y-2 border border-white/5 rounded-lg p-2 bg-black/20 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground gap-2 font-mono text-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-accent" />
              LOADING REGISTRY...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="font-mono text-sm">NO INVESTORS MATCHING "{searchQuery}"</p>
            </div>
          ) : (
            filteredUsers.map(user => {
              const access = getAccessForUser(user.id);
              const hasAccess = !!access;
              const isProcessing = processingId === `grant-${user.id}` || processingId === `remove-${user.id}`;

              return (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-3 rounded border transition-all ${
                    hasAccess ? 'bg-accent/5 border-accent/20 shadow-[0_0_10px_-5px_rgba(16,185,129,0.3)]' : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                         <span className="font-bold text-white text-sm">{user.full_name || 'UNNAMED'}</span>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                            user.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                         }`}>
                           {user.role === 'admin' ? 'ADMIN' : 'INVESTOR'}
                         </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {hasAccess ? (
                      <>
                        <div className="flex items-center gap-4 mr-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-muted-foreground hover:text-white transition-colors select-none group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${access?.can_view ? 'bg-accent border-accent text-black' : 'border-white/20 group-hover:border-white/40'}`}>
                                {access?.can_view && <Check className="w-3 h-3" />}
                            </div>
                            <input
                              type="checkbox"
                              checked={access?.can_view}
                              onChange={(e) => handleUpdatePermission(user.id, 'can_view', e.target.checked)}
                              className="hidden"
                            />
                            VIEW
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-muted-foreground hover:text-white transition-colors select-none group">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${access?.can_download ? 'bg-accent border-accent text-black' : 'border-white/20 group-hover:border-white/40'} ${!access?.can_view ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {access?.can_download && <Check className="w-3 h-3" />}
                            </div>
                            <input
                              type="checkbox"
                              checked={access?.can_download}
                              onChange={(e) => handleUpdatePermission(user.id, 'can_download', e.target.checked)}
                              className="hidden"
                              disabled={!access?.can_view}
                            />
                            EXPORT
                          </label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAccess(user.id)}
                          disabled={isProcessing}
                          className="hover:bg-red-500/20 hover:text-red-400 text-muted-foreground h-8 w-8"
                          title="REVOKE ACCESS"
                        >
                          {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleGrantAccess(user.id)}
                        disabled={isProcessing}
                        className="gap-1 bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white text-xs h-8"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        GRANT
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-right pt-4 border-t border-white/5">
          <Button onClick={onClose} className="bg-white text-black hover:bg-white/90 font-mono text-xs px-6">DONE</Button>
        </div>
      </div>
    </Modal>
  );
};
