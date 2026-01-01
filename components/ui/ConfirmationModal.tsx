import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={variant === 'danger' ? 'CONFIRM ACTION' : 'PLEASE CONFIRM'}
      className="max-w-md bg-[#0B0F19] border-white/10"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-full shrink-0 ${
          variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
        }`}>
          {variant === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
        </div>
        <div className="mt-1">
          <p className="text-sm text-slate-300 leading-relaxed font-mono">
            {message}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
          className="hover:bg-white/10 text-muted-foreground hover:text-white font-mono text-xs"
        >
          {cancelText.toUpperCase()}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className={`${
            variant === 'danger' 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
              : 'bg-accent text-black hover:bg-accent/90'
          } font-mono text-xs font-bold gap-2`}
        >
          {loading ? 'PROCESSING...' : confirmText.toUpperCase()}
        </Button>
      </div>
    </Modal>
  );
};
