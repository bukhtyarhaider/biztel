import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Briefcase, Activity, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils'; // Assuming cn utility exists, otherwise I will use template literals

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
        isActive
          ? 'bg-accent/10 text-accent border-l-2 border-accent'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#0B0F19] border-r border-white/10 flex flex-col pt-6 pb-4 px-4 hidden md:flex z-50">
      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center shadow-lg shadow-accent/20">
          <span className="font-bold text-white text-sm">VC</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-white leading-none">Ventura</h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Capital</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-1 flex-1">
        <div className="mb-6">
          <p className="px-3 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2">Platform</p>
          <div className="space-y-1">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem to="/profile" icon={Settings} label="Settings" />
          </div>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <p className="px-3 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2">Admin Console</p>
            <div className="space-y-1">
              <SidebarItem to="/admin" icon={Shield} label="Overview" />
              <SidebarItem to="/admin/projects" icon={Briefcase} label="Projects" />
              <SidebarItem to="/admin/users" icon={Users} label="Users" />
              <SidebarItem to="/admin/activity" icon={Activity} label="Activity Log" />
            </div>
          </div>
        )}
      </div>

      {/* Footer / Connection Status or stylized element */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-emerald-500 font-mono">SYSTEM ONLINE</span>
        </div>
      </div>
    </aside>
  );
};
