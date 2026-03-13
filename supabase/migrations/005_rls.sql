ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_features ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required for viewing)
CREATE POLICY "Public read properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Public read grid" ON grid_features
  FOR SELECT USING (true);

-- Only authenticated users can modify
CREATE POLICY "Auth insert properties" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth update properties" ON properties
  FOR UPDATE USING (auth.role() = 'authenticated');
