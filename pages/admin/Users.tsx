import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
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

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user: Profile) => {
    const newRole = user.role === 'admin' ? 'client' : 'admin';
    if (!confirm(`Change ${user.email} to ${newRole}?`)) return;
    
    try {
      await userService.updateRole(user.id, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const clientCount = users.filter(u => u.role === 'client').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500">{adminCount} admins · {clientCount} clients</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-slate-500 mt-4">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No users found</h3>
          <p className="text-slate-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'No users have signed up yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                  user.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'
                }`}>
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {user.full_name || 'No Name'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Role Badge */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role === 'admin' ? (
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Admin
                    </span>
                  ) : (
                    'Client'
                  )}
                </span>

                {/* Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleRole(user)}
                  className="gap-2"
                >
                  {user.role === 'admin' ? (
                    <>
                      <ShieldOff className="w-4 h-4" />
                      Remove Admin
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Make Admin
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
