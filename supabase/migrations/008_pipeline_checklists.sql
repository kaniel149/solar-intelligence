-- 008: Pipeline Checklists for Thailand solar process
-- Each project tracks completion of checklist items per pipeline stage

CREATE TABLE IF NOT EXISTS project_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  checklist_item_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, checklist_item_id)
);

-- Index for fast lookups by project
CREATE INDEX IF NOT EXISTS idx_checklists_project ON project_checklists(project_id);

-- RLS
ALTER TABLE project_checklists ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Authenticated users manage checklists"
  ON project_checklists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add LINE ID column to projects if not exists
DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_line_id TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
