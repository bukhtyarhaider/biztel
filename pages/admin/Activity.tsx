import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft,
  RefreshCw,
  Activity,
  LogIn,
  LogOut,
  UserPlus,
  FolderPlus,
  Edit,
  Trash2,
  Users,
  Clock
} from 'lucide-react';
import { ActivityLog } from '../../types/database';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'login': return <LogIn className="w-4 h-4" />;
    case 'logout': return <LogOut className="w-4 h-4" />;
    case 'signup': return <UserPlus className="w-4 h-4" />;
    case 'project_created': return <FolderPlus className="w-4 h-4" />;
    case 'project_updated': return <Edit className="w-4 h-4" />;
    case 'project_deleted': return <Trash2 className="w-4 h-4" />;
    case 'user_assigned': return <Users className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

const getActivityColor = (action: string) => {
  if (action.includes('delete')) return 'bg-red-100 text-red-600';
  if (action.includes('create') || action === 'signup') return 'bg-green-100 text-green-600';
  if (action === 'login') return 'bg-blue-100 text-blue-600';
  if (action === 'logout') return 'bg-slate-100 text-slate-600';
  return 'bg-purple-100 text-purple-600';
};

const formatAction = (action: string) => {
  return action.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const AdminActivity: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<(ActivityLog & { user?: { email: string; full_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await userService.getActivityLogs(100);
      setLogs(data as any);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
          <p className="text-slate-500">{logs.length} recent activities</p>
        </div>
        <Button variant="ghost" onClick={loadLogs} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-slate-500 mt-4">Loading activity logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <Card className="text-center py-12">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No activity yet</h3>
          <p className="text-slate-500 mt-1">User actions will appear here</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${getActivityColor(log.action)}`}>
                  {getActivityIcon(log.action)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {formatAction(log.action)}
                    </span>
                    {log.entity_type && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {log.entity_type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {(log as any).user?.email || 'Anonymous'} 
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <span className="ml-2 text-slate-400">
                        • {JSON.stringify(log.metadata).slice(0, 50)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  {formatTime(log.created_at)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminActivity;
