CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('roof', 'land')),
  status TEXT NOT NULL DEFAULT 'private' CHECK (status IN ('sale', 'rent', 'private')),
  region TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Building',
  location TEXT,

  -- Geometry (PostGIS)
  geom GEOMETRY(Point, 4326) NOT NULL,

  -- Convenience columns (extracted from geom for fast queries)
  lat DOUBLE PRECISION GENERATED ALWAYS AS (ST_Y(geom)) STORED,
  lng DOUBLE PRECISION GENERATED ALWAYS AS (ST_X(geom)) STORED,

  -- Roof-specific
  area DOUBLE PRECISION,
  usable_area DOUBLE PRECISION,
  capacity_kwp DOUBLE PRECISION,
  panel_count INTEGER,
  annual_kwh DOUBLE PRECISION,
  annual_savings DOUBLE PRECISION,
  epc_cost DOUBLE PRECISION,
  solar_score INTEGER,
  priority TEXT CHECK (priority IN ('A', 'B', 'C', 'D')),
  category TEXT,

  -- Land-specific
  size_m2 DOUBLE PRECISION,
  size_rai DOUBLE PRECISION,
  price DOUBLE PRECISION,
  price_per_rai DOUBLE PRECISION,
  listing_link TEXT,

  -- Contact
  owner_name TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,

  -- Grid proximity (calculated)
  grid_grade TEXT CHECK (grid_grade IN ('A', 'B', 'C', 'D')),
  grid_distance_m DOUBLE PRECISION,
  nearest_grid_type TEXT,
  nearest_grid_name TEXT,
  connection_cost_estimate DOUBLE PRECISION,

  -- NASA POWER data (cached)
  annual_ghi DOUBLE PRECISION,  -- kWh/m²/day

  -- Metadata
  source TEXT DEFAULT 'overture',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Spatial index
CREATE INDEX idx_properties_geom ON properties USING GIST (geom);
CREATE INDEX idx_properties_region ON properties (region);
CREATE INDEX idx_properties_type ON properties (type);
CREATE INDEX idx_properties_priority ON properties (priority);
CREATE INDEX idx_properties_capacity ON properties (capacity_kwp);

-- Full text search
CREATE INDEX idx_properties_title_trgm ON properties USING GIN (title gin_trgm_ops);
