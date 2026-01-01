import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Project, Profile, ProjectAccess } from '@/types/database';
import { projectService } from '@/services/projectService';
import { userService } from '@/services/userService';
import { RefreshCw, Search, Check, Trash2, Plus, AlertCircle } from 'lucide-react';
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
      // Default to read-only access
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
    
    // Optimistic update
    const previousAccess = currentAccess;
    const targetAccess = currentAccess.find(a => a.user_id === userId);
    if (!targetAccess) return;

    const updatedPermissions = {
      can_view: targetAccess.can_view,
      can_download: targetAccess.can_download,
      [permission]: value
    };

    // Ensure if download is true, view must be true
    if (permission === 'can_download' && value === true) {
      updatedPermissions.can_view = true;
    }

    // Temporarily update UI
    setCurrentAccess(prev => prev.map(a => 
      a.user_id === userId ? { ...a, ...updatedPermissions } : a
    ));

    try {
      await projectService.assignUser(project.id, userId, updatedPermissions);
    } catch (error) {
      console.error('Error updating permissions:', error);
      // Revert on error
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
      title="Manage Project Access"
      description={project ? `Manage who can access ${project.company_name}` : undefined}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="pl-9"
          />
        </div>

        {/* User List */}
        <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-2 bg-slate-50 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-500 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>No users found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredUsers.map(user => {
              const access = getAccessForUser(user.id);
              const hasAccess = !!access;
              const isProcessing = processingId === `grant-${user.id}` || processingId === `remove-${user.id}`;

              return (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    hasAccess ? 'bg-white border-blue-100 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">{user.full_name || 'Unnamed User'}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {hasAccess ? (
                      <>
                        <div className="flex flex-col gap-1 items-end mr-2">
                          <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                            <input
                              type="checkbox"
                              checked={access?.can_view}
                              onChange={(e) => handleUpdatePermission(user.id, 'can_view', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>View</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                            <input
                              type="checkbox"
                              checked={access?.can_download}
                              onChange={(e) => handleUpdatePermission(user.id, 'can_download', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              disabled={!access?.can_view}
                            />
                            <span>Download</span>
                          </label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAccess(user.id)}
                          disabled={isProcessing}
                          className="hover:bg-red-50 hover:text-red-600"
                          title="Remove Access"
                        >
                          {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleGrantAccess(user.id)}
                        disabled={isProcessing}
                        className="gap-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        Grant Access
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-right">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
};
