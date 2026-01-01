import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Card, CardTitle } from './Card';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className={cn(
        "w-full max-w-lg bg-white border-0 shadow-2xl ring-1 ring-slate-200/50 animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 p-0 overflow-hidden",
        className
      )}>
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-start bg-gradient-to-br from-slate-50 to-white">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </Card>
    </div>
  );
};
