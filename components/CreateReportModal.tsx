import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Link2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import { Card, CardTitle } from './ui/Card';
import { validateSheetUrl } from '../services/googleSheetsService';

export interface CompanyInfo {
  name: string;
}

export interface CreateReportData {
  mode: 'upload' | 'link';
  file?: File;
  sheetUrl?: string;
  companyName: string;
}

interface CreateReportModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onCreate: (data: CreateReportData) => void;
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({ isOpen = true, onClose, onCreate }) => {
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [companyName, setCompanyName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Google Sheets link state
  const [sheetUrl, setSheetUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUrlChange = (url: string) => {
    setSheetUrl(url);
    if (url.trim()) {
      const valid = validateSheetUrl(url);
      setIsUrlValid(valid);
    } else {
      setIsUrlValid(false);
    }
  };

  const handleSubmit = () => {
    if (!companyName.trim()) {
      alert('Please enter a company name');
      return;
    }

    if (mode === 'upload') {
      if (!selectedFile) {
        alert('Please select a file');
        return;
      }
      onCreate({
        mode: 'upload',
        file: selectedFile,
        companyName: companyName.trim()
      });
    } else {
      if (!sheetUrl.trim() || !isUrlValid) {
        alert('Please enter a valid Google Sheets URL');
        return;
      }
      onCreate({
        mode: 'link',
        sheetUrl: sheetUrl.trim(),
        companyName: companyName.trim()
      });
    }
  };

  const isFormValid = () => {
    if (!companyName.trim()) return false;
    if (mode === 'upload') return !!selectedFile;
    return isUrlValid && !!sheetUrl.trim();
  };

  const getValidationIcon = () => {
    if (!sheetUrl.trim()) return null;
    return isUrlValid ? 
      <CheckCircle className="w-4 h-4 text-emerald-500" /> : 
      <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-white border-0 shadow-2xl ring-1 ring-slate-200/50 animate-in zoom-in-95 slide-in-from-bottom-5 duration-200">
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-start bg-gradient-to-br from-slate-50 to-white">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              Create New Report
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Upload a file or link a Google Sheet to get started</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Selector */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setMode('upload')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2",
                mode === 'upload'
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={() => setMode('link')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2",
                mode === 'link'
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Link2 className="w-4 h-4" />
              Link Google Sheet
            </button>
          </div>

          {/* Company Name Input - Always visible */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Company Name
            </label>
            <Input
              type="text"
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">
                Excel File
              </label>
              
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center transition-all",
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : selectedFile
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      className="text-sm"
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium mb-1">
                        Drop your Excel file here
                      </p>
                      <p className="text-sm text-slate-500">or</p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Browse Files
                    </Button>
                    <p className="text-xs text-slate-500">
                      Supports .xlsx and .xls files
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Link Mode */}
          {mode === 'link' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Google Sheets URL
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={cn(
                      "pr-10",
                      sheetUrl && !isUrlValid && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
                      isUrlValid && "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon()}
                  </div>
                </div>
                {sheetUrl && !isUrlValid && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Invalid Google Sheets URL
                  </p>
                )}
                {isUrlValid && (
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Valid Google Sheets URL
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
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

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Linked reports will auto-sync with your Google Sheet to keep data up-to-date.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            {mode === 'upload' ? (
              <>
                <Upload className="w-4 h-4" />
                Create Report
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Link & Create
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateReportModal;
