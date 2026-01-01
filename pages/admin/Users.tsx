import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { 
  Search, 
  Users, 
  Shield, 
  ShieldOff,
  RefreshCw,
  ArrowLeft,
  Mail,
  Calendar
} from 'lucide-react';
import { Profile } from '../../types/database';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confirmation state
  const [roleChangeUser, setRoleChangeUser] = useState<Profile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const confirmRoleChange = (user: Profile) => {
    setRoleChangeUser(user);
  };

  const handleRoleChange = async () => {
    if (!roleChangeUser) return;
    
    setIsProcessing(true);
    const newRole = roleChangeUser.role === 'admin' ? 'client' : 'admin';
    
    try {
      await userService.updateRole(roleChangeUser.id, newRole);
      setUsers(users.map(u => u.id === roleChangeUser.id ? { ...u, role: newRole } : u));
      showToast('success', `User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('error', 'Failed to update role');
    } finally {
      setIsProcessing(false);
      setRoleChangeUser(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const clientCount = users.filter(u => u.role === 'client').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Investor Registry</h1>
          <p className="text-muted-foreground text-sm font-light font-mono">
            <span className="text-accent">{adminCount}</span> ADMINS · <span className="text-blue-400">{clientCount}</span> CLIENTS
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search investors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent/50 transition-all font-mono text-sm"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4 text-sm font-mono tracking-widest">LOADING ACCOUNTS...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card text-center py-20 border border-dashed border-white/10">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white">No accounts found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {searchQuery ? 'Try a different search term' : 'No users have signed up yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="glass-card p-4 rounded-lg border border-white/5 hover:border-white/20 transition-all flex items-center gap-4 group"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold font-mono ${
                user.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
              }`}>
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="font-bold text-white text-sm">
                     {user.full_name || 'No Name'}
                   </h3>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                      user.role === 'admin' 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                   }`}>
                      {user.role === 'admin' ? 'ADMIN' : 'CLIENT'}
                   </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => confirmRoleChange(user)}
                className="opacity-0 group-hover:opacity-100 transition-opacity gap-2 text-xs"
              >
                {user.role === 'admin' ? (
                  <>
                    <ShieldOff className="w-3 h-3" />
                    Revoke Admin
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3" />
                    Grant Admin
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!roleChangeUser}
        onClose={() => setRoleChangeUser(null)}
        onConfirm={handleRoleChange}
        title={roleChangeUser?.role === 'admin' ? 'Revoke Admin Access' : 'Grant Admin Access'}
        message={roleChangeUser?.role === 'admin' 
          ? `Are you sure you want to remove admin privileges from ${roleChangeUser.email}? They will lose access to the admin dashboard.`
          : `Are you sure you want to grant admin privileges to ${roleChangeUser?.email}? They will have full access to the system.`
        }
        confirmText="Update Role"
        variant={roleChangeUser?.role === 'admin' ? 'danger' : 'info'}
        loading={isProcessing}
      />
    </div>
  );
};

export default AdminUsers;
