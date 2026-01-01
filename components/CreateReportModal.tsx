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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-[#0B0F19] border border-white/10 shadow-2xl ring-1 ring-white/5 animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/5">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
              <FileSpreadsheet className="w-6 h-6 text-accent" />
              New Portfolio Asset
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 font-mono">IMPORT FROM EXCEL OR SYNC WITH GOOGLE SHEETS</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Selector */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5 font-mono text-sm">
            <button
              onClick={() => setMode('upload')}
              className={cn(
                "flex-1 py-2 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2",
                mode === 'upload'
                  ? "bg-accent text-black shadow-sm"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Upload className="w-4 h-4" />
              UPLOAD FILE
            </button>
            <button
              onClick={() => setMode('link')}
              className={cn(
                "flex-1 py-2 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2",
                mode === 'link'
                  ? "bg-accent text-black shadow-sm"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Link2 className="w-4 h-4" />
              CONNECT SHEET
            </button>
          </div>

          {/* Company Name Input - Always visible */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Company Name
            </label>
            <Input
              type="text"
              placeholder="ENTER COMPANY NAME..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-black/20 border-white/10 text-white placeholder:text-muted-foreground focus:border-accent font-mono"
            />
          </div>

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Excel File Source
              </label>
              
              <div
                className={cn(
                  "relative border border-dashed rounded-xl p-8 text-center transition-all bg-black/20",
                  dragActive
                    ? "border-accent bg-accent/5"
                    : selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
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
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                      <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-white font-mono">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      className="text-xs border-white/10 text-muted-foreground hover:text-white hover:bg-white/5"
                    >
                      REMOVE FILE
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1 font-mono">
                        DROP EXCEL FILE HERE
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">OR CLICK TO BROWSE</p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="gap-2 border-white/10 text-white hover:bg-white/5"
                    >
                      <Upload className="w-4 h-4" />
                      BROWSE FILES
                    </Button>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                      SUPPORTS .XLSX AND .XLS FORMATS
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
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Google Drive Link
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="HTTPS://DOCS.GOOGLE.COM/SPREADSHEETS/..."
                    value={sheetUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={cn(
                      "pr-10 bg-black/20 text-white placeholder:text-muted-foreground font-mono text-xs",
                      sheetUrl && !isUrlValid && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
                      isUrlValid && "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20",
                      !sheetUrl && "border-white/10 focus:border-accent"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon()}
                  </div>
                </div>
                {sheetUrl && !isUrlValid && (
                  <p className="text-xs text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3" />
                    INVALID SHEET URL
                  </p>
                )}
                {isUrlValid && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle className="w-3 h-3" />
                    VALID SHEET URL
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 space-y-2">
                <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-2 uppercase tracking-wide">
                  <Link2 className="w-3 h-3" />
                  Access Configuration
                </h4>
                <ol className="text-xs text-blue-300/80 space-y-1 list-decimal list-inside font-mono">
                  <li>OPEN GOOGLE SHEET</li>
                  <li>CLICK "SHARE" (TOP RIGHT)</li>
                  <li>SET ACCESS: "ANYONE WITH LINK"</li>
                  <li>SET ROLE: "VIEWER"</li>
                  <li>PASTE LINK ABOVE</li>
                </ol>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                <p className="text-xs text-amber-500/80 font-mono">
                  <strong className="text-amber-500">NOTE:</strong> LINKED PORTFOLIOS WILL AUTO-SYNC DATA REGULARLY.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-white hover:bg-white/5 font-mono text-xs"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="bg-accent hover:bg-accent/90 text-black disabled:opacity-50 disabled:cursor-not-allowed gap-2 font-bold text-xs tracking-wider"
          >
            {mode === 'upload' ? (
              <>
                <Upload className="w-4 h-4" />
                CREATE PORTFOLIO
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                LINK & CREATE
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateReportModal;
