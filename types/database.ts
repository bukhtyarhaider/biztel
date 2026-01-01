/**
 * Database Types for Supabase
 */

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'client';
  created_at: string;
}

export interface Project {
  id: string;
  company_name: string;
  sheet_url: string | null;
  sheet_id: string | null;
  transactions: any[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectAccess {
  id: string;
  project_id: string;
  user_id: string;
  can_view: boolean;
  can_download: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: 'project' | 'user' | 'access' | 'auth';
  entity_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

// Extended types with relations
export interface ProjectWithAccess extends Project {
  project_access?: ProjectAccess[];
}

export interface ProfileWithProjects extends Profile {
  project_access?: (ProjectAccess & { project: Project })[];
}
