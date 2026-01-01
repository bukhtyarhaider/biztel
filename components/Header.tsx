import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/Button';

interface HeaderProps {
  onNewReport: () => void;
  showActions?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewReport, showActions = true }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Biz<span className="text-primary">tel</span> Intelligence
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage and analyze financial reports for your companies.
        </p>
      </div>
      {showActions && (
        <Button onClick={onNewReport} className="gap-2 shadow-sm transition-all transform hover:scale-105">
          <Plus className="w-5 h-5" />
          Generate New Report
        </Button>
      )}
    </div>
  );
};

export default Header;
