import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Shield, User } from 'lucide-react';
import { Button } from './ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-white">IB</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Intelbiz</h1>
            {isAdmin && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/profile"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            <User className="w-4 h-4" />
            {profile?.full_name || profile?.email}
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};
