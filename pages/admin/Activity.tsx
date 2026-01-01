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
  Clock,
  Terminal
} from 'lucide-react';
import { ActivityLog } from '../../types/database';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'login': return <LogIn className="w-3 h-3" />;
    case 'logout': return <LogOut className="w-3 h-3" />;
    case 'signup': return <UserPlus className="w-3 h-3" />;
    case 'project_created': return <FolderPlus className="w-3 h-3" />;
    case 'project_updated': return <Edit className="w-3 h-3" />;
    case 'project_deleted': return <Trash2 className="w-3 h-3" />;
    case 'user_assigned': return <Users className="w-3 h-3" />;
    default: return <Activity className="w-3 h-3" />;
  }
};

const getActivityColor = (action: string) => {
  if (action.includes('delete')) return 'text-red-400 bg-red-400/10 border-red-400/20';
  if (action.includes('create') || action === 'signup') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (action === 'login') return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  if (action === 'logout') return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [category, setCategory] = useState<'all' | 'auth' | 'project' | 'user' | 'access'>('all');

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadLogs();
  }, [page, category]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, count } = await userService.getActivityLogs(page, ITEMS_PER_PAGE, category);
      setLogs(data as any);
      setTotalItems(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'ALL LOGS' },
    { id: 'auth', label: 'AUTH' },
    { id: 'project', label: 'PORTFOLIO' },
    { id: 'user', label: 'USERS' },
    { id: 'access', label: 'ACCESS' },
  ];

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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">System Audit Trail</h1>
          <p className="text-muted-foreground text-sm font-mono">
            SECURE LOGGING ENABLED · <span className="text-accent">{totalItems} EVENTS</span>
          </p>
        </div>
        <Button variant="ghost" onClick={loadLogs} className="gap-2 text-xs font-mono">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          SYNC LOGS
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id as any); setPage(1); }}
            className={`px-3 py-1 rounded text-[10px] font-mono tracking-wider transition-all border ${
              category === cat.id
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'bg-white/5 text-muted-foreground border-transparent hover:border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4 text-sm font-mono tracking-widest">FETCHING LOGS...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card text-center py-20 border border-dashed border-white/10">
          <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white">No logs found</h3>
          <p className="text-muted-foreground mt-1 text-sm font-mono">System is silent.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-white/5 transition-colors flex items-center gap-4 text-sm group">
                {/* Time */}
                <div className="w-24 text-xs font-mono text-muted-foreground text-right shrink-0">
                   {formatTime(log.created_at)}
                </div>

                {/* Status Indicator */}
                <div className={`p-1.5 rounded border shrink-0 ${getActivityColor(log.action)}`}>
                  {getActivityIcon(log.action)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">
                        {formatAction(log.action)}
                    </span>
                    {log.entity_type && (
                        <span className="text-[10px] uppercase bg-white/5 text-muted-foreground px-1.5 py-0.5 rounded border border-white/5">
                            {log.entity_type}
                        </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-2">
                    <span className="text-slate-400">
                        USER: {(log as any).user?.full_name || (log as any).user?.email || 'SYSTEM'}
                    </span>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600">
                            · {JSON.stringify(log.metadata).slice(0, 80)}
                        </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white/5 border-t border-white/5">
              <p className="text-xs text-muted-foreground font-mono">
                SHOWING <span className="text-white">{(page - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="text-white">{Math.min(page * ITEMS_PER_PAGE, totalItems)}</span> OF <span className="text-white">{totalItems}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 text-xs"
                >
                  PREV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-7 text-xs"
                >
                  NEXT
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminActivity;
