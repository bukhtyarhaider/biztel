import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import { Card, CardTitle } from './ui/Card';

export interface CompanyInfo {
    name: string;
}

interface CreateReportModalProps {
  isOpen?: boolean;
  onClose: () => void;
  // App.tsx uses `onCreate` but component has `onSubmit`.
  // createReportModal props: isOpen, onClose, onSubmit.
  // App.tsx: <CreateReportModal ... onCreate={...} />
  // This is a mismatch!
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({ isOpen = true, onClose, onCreate }) => {
  const [companyName, setCompanyName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
      setSelectedFile(file);
      if (!companyName) {
          setCompanyName(file.name.replace(/\.[^/.]+$/, ""));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert("Please enter a company name.");
      return;
    }
    if (!selectedFile) {
        fileInputRef.current?.click();
        return; 
    }
    onCreate(selectedFile, { name: companyName });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          handleFile(e.target.files[0]);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 border-0 shadow-2xl glass ring-1 ring-white/20">
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-slate-50/30">
           <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            New Financial Report
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200/50">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>
        
        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Company Name</label>
              <Input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Inc."
                autoFocus
                className="h-12 text-lg bg-white/50 backdrop-blur-sm border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group relative overflow-hidden",
                dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50",
                selectedFile ? "bg-emerald-50/30 border-emerald-500/50" : ""
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                  if (!companyName.trim()) {
                      alert("Please enter a company name first.");
                      return;
                  }
                  fileInputRef.current?.click();
              }}
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110",
                selectedFile ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-blue-600"
              )}>
                {selectedFile ? <FileSpreadsheet className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-slate-900">
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-slate-500">Excel (XLSX, CSV) files only</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <Button type="button" variant="ghost" onClick={onClose} className="text-slate-600">
                 Cancel
               </Button>
               <Button type="submit" disabled={!selectedFile} className={cn("transition-all duration-300", selectedFile ? "translate-y-0 opacity-100" : "translate-y-2 opacity-50")}>
                   Create Report
               </Button>
            </div>
          </form>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
      </Card>
    </div>
  );
};

export default CreateReportModal;
