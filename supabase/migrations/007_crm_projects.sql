-- ============================================
-- 007_crm_projects.sql
-- CRM Pipeline: projects, activity_log, user_profiles
-- ============================================

-- 1. Projects table (leads + pipeline)
CREATE TABLE IF NOT EXISTS projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client info
  client_name     text NOT NULL,
  business_type   text,
  client_phone    text,
  client_email    text,

  -- Property/building link
  property_address text,
  building_id     text,
  lat             float8,
  lng             float8,

  -- Pipeline
  status          text NOT NULL DEFAULT 'lead',
  step_number     int NOT NULL DEFAULT 1,
  priority        text DEFAULT 'normal',

  -- Solar system
  system_size_kwp     float8,
  panel_count         int,
  panel_model         text,
  inverter_model      text,
  battery_model       text,
  annual_production   float8,

  -- Financial
  deal_value          float8,
  deal_type           text,
  monthly_consumption float8,
  electricity_rate    float8,
  payback_years       float8,

  -- Survey data
  roof_type           text,
  roof_condition      text,
  roof_area_m2        float8,
  usable_area_m2      float8,
  roof_angle          float8,
  roof_direction      text,
  electrical_phase    text,
  shading_notes       text,

  -- Meta
  source          text,
  assigned_to     uuid REFERENCES auth.users(id),
  notes           text,
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 2. Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id),
  action      text NOT NULL,
  details     jsonb,
  created_at  timestamptz DEFAULT now()
);

-- 3. User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name   text NOT NULL,
  role        text DEFAULT 'viewer',
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_building ON projects(building_id);
CREATE INDEX IF NOT EXISTS idx_projects_step ON projects(step_number);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read projects" ON projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert projects" ON projects
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update projects" ON projects
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete projects" ON projects
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth read activity" ON activity_log
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert activity" ON activity_log
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read profiles" ON user_profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Auth insert profiles" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (true);
