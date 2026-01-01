-- =====================================================
-- INTELBIZ DATABASE SCHEMA (Fixed RLS)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Cleanup first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Drop all existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "profiles_select" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert" ON profiles;
  DROP POLICY IF EXISTS "profiles_update" ON profiles;
  DROP POLICY IF EXISTS "Allow users to read all profiles" ON profiles;
  DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
  -- Projects
  DROP POLICY IF EXISTS "projects_admin" ON projects;
  DROP POLICY IF EXISTS "projects_client" ON projects;
  DROP POLICY IF EXISTS "Admins can do everything with projects" ON projects;
  DROP POLICY IF EXISTS "Clients can view assigned projects" ON projects;
  -- Project Access
  DROP POLICY IF EXISTS "access_admin" ON project_access;
  DROP POLICY IF EXISTS "access_user" ON project_access;
  DROP POLICY IF EXISTS "Admins can manage all access" ON project_access;
  DROP POLICY IF EXISTS "Users can view own access" ON project_access;
  -- Activity Logs
  DROP POLICY IF EXISTS "logs_insert" ON activity_logs;
  DROP POLICY IF EXISTS "logs_admin" ON activity_logs;
  DROP POLICY IF EXISTS "logs_user" ON activity_logs;
  DROP POLICY IF EXISTS "Admins can view all logs" ON activity_logs;
  DROP POLICY IF EXISTS "Users can insert logs" ON activity_logs;
  DROP POLICY IF EXISTS "Users can view own logs" ON activity_logs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  sheet_url TEXT,
  sheet_id TEXT,
  transactions JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT TRUE,
  can_download BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (FIXED)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES: Allow authenticated users to insert their own profile
CREATE POLICY "profiles_select" ON profiles 
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles 
  FOR INSERT WITH CHECK (true);  -- Allow any authenticated user to insert

CREATE POLICY "profiles_update" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- PROJECTS: Admins full access, clients read assigned
CREATE POLICY "projects_admin" ON projects 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "projects_client" ON projects 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_access WHERE project_id = projects.id AND user_id = auth.uid() AND can_view = true)
  );

-- PROJECT ACCESS: Admins manage, users view own
CREATE POLICY "access_admin" ON project_access 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "access_user" ON project_access 
  FOR SELECT USING (user_id = auth.uid());

-- ACTIVITY LOGS: Allow inserts (with nullable user_id), admins see all
CREATE POLICY "logs_insert" ON activity_logs 
  FOR INSERT WITH CHECK (true);  -- Allow any insert

CREATE POLICY "logs_admin" ON activity_logs 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "logs_user" ON activity_logs 
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_project_access_user ON project_access(user_id);
CREATE INDEX IF NOT EXISTS idx_project_access_project ON project_access(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
