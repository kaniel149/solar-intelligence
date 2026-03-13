CREATE TABLE grid_features (
  id TEXT PRIMARY KEY,
  power_type TEXT NOT NULL,
  name TEXT,
  name_th TEXT,
  voltage TEXT,
  operator TEXT,
  region TEXT NOT NULL,
  source TEXT DEFAULT 'osm',

  -- Geometry (can be Point, LineString, or Polygon)
  geom GEOMETRY(Geometry, 4326) NOT NULL,

  osm_id BIGINT,
  osm_type TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_grid_geom ON grid_features USING GIST (geom);
CREATE INDEX idx_grid_region ON grid_features (region);
CREATE INDEX idx_grid_power_type ON grid_features (power_type);
