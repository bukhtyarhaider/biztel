/**
 * User Service
 * Database operations for user management
 */

import { supabase } from '../lib/supabaseClient';
import { Profile, ProfileWithProjects, ActivityLog } from '../types/database';

export const userService = {
  // Get all users (admin only)
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user by ID
  async getById(id: string): Promise<ProfileWithProjects | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        project_access (
          *,
          project:projects (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user role
  async updateRole(userId: string, role: 'admin' | 'client'): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    // Log activity
    await supabase.from('activity_logs').insert({
      action: 'role_changed',
      entity_type: 'user',
      entity_id: userId,
      metadata: { new_role: role }
    });

    return data;
  },

  // Get activity logs
  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles (email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get activity logs for a specific user
  async getUserActivity(userId: string, limit: number = 20): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get counts for dashboard
  async getDashboardStats(): Promise<{ projectCount: number; userCount: number; recentActivity: number }> {
    const [projects, users, activity] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    return {
      projectCount: projects.count || 0,
      userCount: users.count || 0,
      recentActivity: activity.count || 0
    };
  }
};

export default userService;
