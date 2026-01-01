import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const styles = {
  success: 'border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_-5px_rgba(16,185,129,0.4)]',
  error: 'border-red-500/20 bg-red-500/10 shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]',
  info: 'border-blue-500/20 bg-blue-500/10 shadow-[0_0_15px_-5px_rgba(59,130,246,0.4)]'
};

export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-full",
      styles[type],
      "min-w-[300px] max-w-md pointer-events-auto"
    )}>
      <div className="shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white font-mono leading-relaxed">
          {message}
        </p>
      </div>
      <button 
        onClick={() => onClose(id)}
        className="shrink-0 text-muted-foreground hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
