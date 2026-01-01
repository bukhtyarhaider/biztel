/**
 * Project Service
 * Database operations for projects
 */

import { supabase } from '../lib/supabaseClient';
import { Project, ProjectAccess, ProjectWithAccess } from '../types/database';

export const projectService = {
  // Get all projects (admin only)
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get project by ID
  async getById(id: string): Promise<ProjectWithAccess | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_access (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create project
  async create(project: Partial<Project>): Promise<Project> {
    const payload = {
      company_name: project.company_name,
      sheet_url: project.sheet_url || null,
      sheet_id: project.sheet_id || null,
      transactions: project.transactions || [],
      created_by: project.created_by,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase create error:', error);
      throw error;
    }
    
    // Async log (fire and forget)
    supabase.from('activity_logs').insert({
      action: 'project_created',
      entity_type: 'project',
      entity_id: data.id,
      metadata: { company_name: project.company_name }
    }).then();

    return data;
  },

  // Update project
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Log activity
    await supabase.from('activity_logs').insert({
      action: 'project_updated',
      entity_type: 'project',
      entity_id: id,
      metadata: { updates: Object.keys(updates) }
    });

    return data;
  },

  // Delete project
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Log activity
    await supabase.from('activity_logs').insert({
      action: 'project_deleted',
      entity_type: 'project',
      entity_id: id
    });
  },

  // Get projects for a specific user (client)
  async getForUser(userId: string): Promise<(Project & { access: ProjectAccess })[]> {
    const { data, error } = await supabase
      .from('project_access')
      .select(`
        *,
        project:projects (*)
      `)
      .eq('user_id', userId)
      .eq('can_view', true);

    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item.project,
      access: {
        id: item.id,
        project_id: item.project_id,
        user_id: item.user_id,
        can_view: item.can_view,
        can_download: item.can_download,
        created_at: item.created_at
      }
    }));
  },

  // Assign user to project
  async assignUser(projectId: string, userId: string, permissions: { can_view: boolean; can_download: boolean }): Promise<ProjectAccess> {
    const { data, error } = await supabase
      .from('project_access')
      .upsert({
        project_id: projectId,
        user_id: userId,
        ...permissions
      })
      .select()
      .single();

    if (error) throw error;
    
    // Log activity
    await supabase.from('activity_logs').insert({
      action: 'user_assigned',
      entity_type: 'access',
      entity_id: data.id,
      metadata: { project_id: projectId, user_id: userId, ...permissions }
    });

    return data;
  },

  // Remove user from project
  async removeUser(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_access')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
    
    // Log activity
    await supabase.from('activity_logs').insert({
      action: 'user_removed',
      entity_type: 'access',
      metadata: { project_id: projectId, user_id: userId }
    });
  },

  // Get users with access to a project
  async getProjectUsers(projectId: string): Promise<ProjectAccess[]> {
    const { data, error } = await supabase
      .from('project_access')
      .select(`
        *,
        user:profiles (*)
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  }
};

export default projectService;
