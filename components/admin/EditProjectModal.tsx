import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project } from '@/types/database';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Project>) => Promise<void>;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  project, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    company_name: '',
    sheet_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        company_name: project.company_name,
        sheet_url: project.sheet_url || ''
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setLoading(true);
    try {
      await onSave(project.id, {
        company_name: formData.company_name,
        sheet_url: formData.sheet_url || null
      });
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="EDIT PORTFOLIO DETAILS"
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Company Name
          </label>
          <Input
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            required
            className="bg-black/20 border-white/10 text-white placeholder:text-muted-foreground focus:border-accent font-mono"
            placeholder="ENTER COMPANY NAME"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Data Source (Google Sheets)
          </label>
          <Input
            value={formData.sheet_url}
            onChange={(e) => setFormData(prev => ({ ...prev, sheet_url: e.target.value }))}
            className="bg-black/20 border-white/10 text-white placeholder:text-muted-foreground focus:border-accent font-mono text-xs"
            placeholder="HTTPS://DOCS.GOOGLE.COM/SPREADSHEETS/..."
          />
          <p className="text-[10px] text-muted-foreground mt-2 font-mono">
            OPTIONAL · USED FOR LIVE TRANSACTION SYNC
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="hover:bg-white/10 text-muted-foreground hover:text-white"
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-accent text-black hover:bg-accent/90"
          >
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
