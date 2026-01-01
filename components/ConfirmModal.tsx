/**
 * ConfirmModal Component
 * Reusable confirmation dialog
 */

import React from 'react';
import { Card, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 border-0 shadow-2xl glass ring-1 ring-white/20">
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-start bg-slate-50/30">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', style.iconBg)}>
              <Icon className={cn('w-5 h-5', style.iconColor)} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 mb-1">
                {title}
              </CardTitle>
              <p className="text-sm text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel} 
            className="rounded-full hover:bg-slate-200/50 -mt-1 -mr-1"
          >
            <X className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
        
        <div className="p-6 bg-white">
          <div className="flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="text-slate-600 hover:bg-slate-100"
            >
              {cancelText}
            </Button>
            <Button 
              onClick={onConfirm}
              className={cn('transition-all duration-200', style.buttonClass)}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;
