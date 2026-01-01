import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Bell, Search, Menu } from 'lucide-react';
import { Button } from './ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Left Area: Breadcrumbs or Page Title Placeholder */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-muted-foreground hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-white font-medium">Overview</span>
          <span className="text-white/20">/</span>
          <span>Market Summary</span>
        </div>
      </div>

      {/* Center Area: Market Ticker (Visual only for now) */}
      <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">BTC/USD</span>
          <span className="text-emerald-500">+2.4%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">ETH/USD</span>
          <span className="text-emerald-500">+1.8%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">NSDQ</span>
          <span className="text-red-400">-0.2%</span>
        </div>
      </div>

      {/* Right Area: Actions & Profile */}
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="h-9 w-64 bg-white/5 border border-white/10 rounded-full pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full"></span>
        </Button>

        <div className="h-6 w-px bg-white/10 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">{profile?.full_name || 'Trader'}</p>
            <p className="text-xs text-muted-foreground mt-1">Pro Account</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSignOut}
            className="rounded-full bg-white/5 hover:bg-white/10 text-white"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
