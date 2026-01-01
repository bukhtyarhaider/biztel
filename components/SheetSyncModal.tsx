/**
 * SheetSyncModal Component
 * Modal for configuring Google Sheets synchronization
 */

import React, { useState } from 'react';
import { Card, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Link2, X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { validateSheetUrl } from '../services/googleSheetsService';

export interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (url: string, autoSync: boolean, interval: number) => Promise<boolean>;
  initialUrl?: string;
  initialAutoSync?: boolean;
  initialInterval?: number;
}

const SheetSyncModal: React.FC<SheetSyncModalProps> = ({
  isOpen,
  onClose,
  onLink,
  initialUrl = '',
  initialAutoSync = false,
  initialInterval = 30
}) => {
  const [sheetUrl, setSheetUrl] = useState(initialUrl);
  const [autoSync, setAutoSync] = useState(initialAutoSync);
  const [syncInterval, setSyncInterval] = useState(initialInterval);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  if (!isOpen) return null;

  const handleUrlChange = (url: string) => {
    setSheetUrl(url);
    setValidationError(null);
    setIsValid(false);

    if (url.trim()) {
      const valid = validateSheetUrl(url);
      if (!valid) {
        setValidationError('Invalid Google Sheets URL');
      } else {
        setIsValid(true);
      }
    }
  };

  const handleLink = async () => {
    if (!isValid) return;

    setIsValidating(true);
    const success = await onLink(sheetUrl, autoSync, syncInterval);
    setIsValidating(false);

    if (success) {
      onClose();
    } else {
      setValidationError('Failed to link sheet. Please check the URL and try again.');
    }
  };

  const getValidationIcon = () => {
    if (!sheetUrl.trim()) return null;
    if (validationError) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (isValid) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 border-0 shadow-2xl glass ring-1 ring-white/20">
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-start bg-slate-50/30">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Link2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 mb-1">
                Link Google Sheets
              </CardTitle>
              <p className="text-sm text-slate-600">
                Connect a public Google Sheet to keep your report data synchronized
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-slate-200/50 -mt-1 -mr-1"
          >
            <X className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6 bg-white">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Google Sheets URL
            </label>
            <div className="relative">
              <Input
                type="url"
                value={sheetUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className={cn(
                  "pr-10",
                  validationError && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
                  isValid && "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                )}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            </div>
            {validationError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationError}
              </p>
            )}
            {isValid && (
              <p className="text-sm text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valid Google Sheets URL
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              How to make your sheet public
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Open your Google Sheet</li>
              <li>Click "Share" in the top right</li>
              <li>Change access to "Anyone with the link"</li>
              <li>Set permission to "Viewer"</li>
              <li>Copy the link and paste it above</li>
            </ol>
          </div>

          {/* Auto-sync Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Auto-sync
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically sync data at regular intervals
                </p>
              </div>
              <button
                onClick={() => setAutoSync(!autoSync)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  autoSync ? "bg-blue-600" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    autoSync ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {autoSync && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <label className="text-sm font-semibold text-slate-700">
                  Sync interval
                </label>
                <select
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>Every 5 minutes</option>
                  <option value={15}>Every 15 minutes</option>
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every hour</option>
                  <option value={180}>Every 3 hours</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={isValidating}
              className="text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLink}
              disabled={!isValid || isValidating}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Linking...' : 'Link Sheet'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SheetSyncModal;
