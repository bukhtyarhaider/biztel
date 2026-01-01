/**
 * Profile Page
 * View and update profile, see assigned project access
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  ArrowLeft,
  User,
  Mail,
  Shield,
  Save,
  FolderKanban,
  Check,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Project, ProjectAccess } from '../types/database';
import { projectService } from '../services/projectService';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [projects, setProjects] = useState<(Project & { access: ProjectAccess })[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user && !isAdmin) {
      // Load assigned projects for clients
      projectService.getForUser(user.id)
        .then(setProjects)
        .catch(console.error)
        .finally(() => setLoadingProjects(false));
    } else {
      setLoadingProjects(false);
    }
  }, [user, isAdmin]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500">View and update your account information</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-slate-400" />
          Account Information
        </h2>

        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </span>
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
            />
          </div>

          {/* Full Name (editable) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </span>
            </label>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Shield className="w-4 h-4" />
              {isAdmin ? 'Administrator' : 'Client'}
            </div>
          </div>

          {/* Member Since */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </span>
            </label>
            <p className="text-slate-600">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown'}
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSave} 
              disabled={saving || fullName === profile?.full_name}
              className="gap-2"
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved!
                </>
              ) : saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Access Permissions (for clients) */}
      {!isAdmin && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-slate-400" />
            My Project Access
          </h2>

          {loadingProjects ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="text-slate-500 mt-4">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p>No projects assigned yet.</p>
              <p className="text-sm">Contact your administrator to get access.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderKanban className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{project.company_name}</h3>
                      <p className="text-sm text-slate-500">
                        {project.transactions?.length || 0} transactions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {project.access.can_view && (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <Eye className="w-3 h-3" />
                        View
                      </span>
                    )}
                    {project.access.can_download && (
                      <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <Download className="w-3 h-3" />
                        Download
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Admin Info */}
      {isAdmin && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Administrator Access
          </h2>
          <p className="text-slate-600">
            As an administrator, you have full access to all projects, users, and settings.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Create, edit, and delete projects
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Manage users and assign roles
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              View all activity logs
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Assign project access to clients
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
