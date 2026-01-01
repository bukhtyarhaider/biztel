import React from 'react';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Outlet />
    </div>
  );
};
