-- =====================================================
-- HARD RESET SCRIPT (With CASCADE)
-- Run this in Supabase SQL Editor to reset projects
-- =====================================================

-- Drop tables with CASCADE to remove dependent policies automatically
DROP TABLE IF EXISTS project_access CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- 1. Recreate Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  sheet_url TEXT,
  sheet_id TEXT,
  transactions JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Recreate Access Table
CREATE TABLE project_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT TRUE,
  can_download BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_access ENABLE ROW LEVEL SECURITY;

-- 4. Simple Permissive Policies for Testing

-- Projects: Everyone can select
CREATE POLICY "Enable read access for all users"
ON projects FOR SELECT
USING (true);

-- Projects: Authenticated users can insert
CREATE POLICY "Enable insert for authenticated users"
ON projects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Projects: Everyone can update/delete (for now)
CREATE POLICY "Enable update for all"
ON projects FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for all"
ON projects FOR DELETE
USING (true);

-- Access: Everyone can select/insert/update/delete
CREATE POLICY "Enable full access to project_access"
ON project_access FOR ALL
USING (true);
