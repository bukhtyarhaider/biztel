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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className={cn(
        "w-full max-w-lg bg-[#0B0F19] border border-white/10 shadow-2xl ring-1 ring-white/5 animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 p-0 overflow-hidden",
        className
      )}>
        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/5">
          <div>
            <CardTitle className="text-lg font-bold text-white uppercase tracking-wider font-mono">
              {title}
            </CardTitle>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">{description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </Card>
    </div>
  );
};
