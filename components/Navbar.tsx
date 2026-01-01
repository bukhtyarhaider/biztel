import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Bell, Search, Menu, Building2, Briefcase } from 'lucide-react';
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
    <header className="h-16 border-b border-white/5 bg-[#050505]/95 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Left Area: Branding */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-muted-foreground hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
            <Building2 className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-wider text-sm leading-none">VENTURA CAPITAL</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest mt-0.5">INSTITUTIONAL ACCESS</p>
          </div>
        </div>
      </div>



      {/* Right Area: Actions & Profile */}
      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none tracking-wide">{profile?.full_name?.toUpperCase() || 'TRADER'}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{profile?.role === 'admin' ? 'ADMINISTRATOR' : 'INVESTOR'} ACCT</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-white/10 to-white/5 rounded flex items-center justify-center border border-white/10">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSignOut}
            className="rounded hover:bg-red-500/10 hover:text-red-400 text-muted-foreground -mr-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
