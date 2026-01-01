/**
 * useConfirm Hook
 * Manages confirmation modal state and logic
 */

import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface UseConfirmReturn {
  isOpen: boolean;
  options: ConfirmOptions | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

/**
 * Custom hook for managing confirmation dialogs
 * @returns Confirmation state and methods
 */
export const useConfirm = (): UseConfirmReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((confirmOptions: ConfirmOptions): Promise<boolean> => {
    setOptions(confirmOptions);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
    }
    setResolvePromise(null);
    setOptions(null);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
    }
    setResolvePromise(null);
    setOptions(null);
  }, [resolvePromise]);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel
  };
};
