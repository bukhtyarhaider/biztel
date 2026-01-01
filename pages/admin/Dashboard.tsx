import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard'; 
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
  Clock,
  Briefcase,
  Shield,
  FileText
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
      title: 'Active Portfolios',
      value: stats.projectCount,
      icon: <Briefcase className="w-5 h-5" />,
      colorClass: 'bg-emerald-500/10 text-emerald-500',
      path: '/admin/projects'
    },
    {
      title: 'Investor Accounts',
      value: stats.userCount,
      icon: <Users className="w-5 h-5" />,
      colorClass: 'bg-blue-500/10 text-blue-500',
      path: '/admin/users'
    },
    {
      title: 'System Events',
      value: stats.recentActivity,
      icon: <Activity className="w-5 h-5" />,
      colorClass: 'bg-amber-500/10 text-amber-500',
      path: '/admin/activity'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Command Console</h1>
          <p className="text-muted-foreground mt-1 text-sm font-light">System overview and management controls.</p>
        </div>
        <Button onClick={() => navigate('/admin/projects')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Portfolio
        </Button>
      </div>

      {/* Quick Stats as Tickers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} onClick={() => navigate(stat.path)} className="cursor-pointer group">
             <DashboardCard
               title={stat.title}
               value={loading ? '-' : stat.value}
               icon={stat.icon}
               colorClass={stat.colorClass}
               subValue="Total Records"
             />
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Management Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          onClick={() => navigate('/admin/projects')}
          className="p-6 cursor-pointer hover:border-accent/50 transition-all flex flex-col gap-4 group"
        >
          <div className="flex items-center justify-between">
             <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
               <Briefcase className="w-6 h-6" />
             </div>
             <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Portfolio Management</h3>
            <p className="text-xs text-muted-foreground mt-1">Create and manage investment portfolios.</p>
          </div>
        </Card>

        <Card 
          onClick={() => navigate('/admin/users')}
          className="p-6 cursor-pointer hover:border-accent/50 transition-all flex flex-col gap-4 group"
        >
          <div className="flex items-center justify-between">
             <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
               <Users className="w-6 h-6" />
             </div>
             <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Investor Registry</h3>
            <p className="text-xs text-muted-foreground mt-1">Manage user access and roles.</p>
          </div>
        </Card>

        <Card 
          onClick={() => navigate('/admin/activity')}
          className="p-6 cursor-pointer hover:border-accent/50 transition-all flex flex-col gap-4 group"
        >
          <div className="flex items-center justify-between">
             <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
               <Activity className="w-6 h-6" />
             </div>
             <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">System Audit</h3>
            <p className="text-xs text-muted-foreground mt-1">Track system-wide events and logs.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
