import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { 
  FolderKanban, 
  Users, 
  Activity, 
  Plus,
  ArrowUpRight,
  Clock
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projectCount: 0, userCount: 0, recentActivity: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getDashboardStats()
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickStats = [
    {
      title: 'Total Projects',
      value: stats.projectCount,
      icon: <FolderKanban className="w-6 h-6" />,
      color: 'bg-blue-500',
      path: '/admin/projects'
    },
    {
      title: 'Total Users',
      value: stats.userCount,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      path: '/admin/users'
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-purple-500',
      path: '/admin/activity'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your projects and users</p>
        </div>
        <Button onClick={() => navigate('/admin/projects')} className="gap-2">
          <Plus className="w-5 h-5" />
          New Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Card 
            key={index}
            onClick={() => navigate(stat.path)}
            className="p-6 cursor-pointer hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{loading ? '-' : stat.value}</p>
              <p className="text-slate-500 mt-1">{stat.title}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          onClick={() => navigate('/admin/projects')}
          className="p-6 cursor-pointer hover:shadow-lg transition-all flex items-center gap-4"
        >
          <div className="p-3 bg-blue-100 rounded-xl">
            <FolderKanban className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Manage Projects</h3>
            <p className="text-sm text-slate-500">Create, edit, and assign projects</p>
          </div>
        </Card>

        <Card 
          onClick={() => navigate('/admin/users')}
          className="p-6 cursor-pointer hover:shadow-lg transition-all flex items-center gap-4"
        >
          <div className="p-3 bg-green-100 rounded-xl">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Manage Users</h3>
            <p className="text-sm text-slate-500">View and manage user access</p>
          </div>
        </Card>

        <Card 
          onClick={() => navigate('/admin/activity')}
          className="p-6 cursor-pointer hover:shadow-lg transition-all flex items-center gap-4"
        >
          <div className="p-3 bg-purple-100 rounded-xl">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Activity Logs</h3>
            <p className="text-sm text-slate-500">Track user actions and events</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
