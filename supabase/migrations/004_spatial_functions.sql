-- Find nearest grid infrastructure to a point
CREATE OR REPLACE FUNCTION nearest_grid(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  power_type TEXT,
  name TEXT,
  voltage TEXT,
  distance_m DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.power_type,
    g.name,
    g.voltage,
    ST_Distance(
      g.geom::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) as distance_m
  FROM grid_features g
  ORDER BY g.geom <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Calculate grid grade for a point
CREATE OR REPLACE FUNCTION grid_grade(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION
)
RETURNS TABLE (
  grade TEXT,
  distance_m DOUBLE PRECISION,
  nearest_type TEXT,
  nearest_name TEXT,
  connection_cost DOUBLE PRECISION
) AS $$
DECLARE
  v_distance DOUBLE PRECISION;
  v_type TEXT;
  v_name TEXT;
BEGIN
  SELECT
    ST_Distance(g.geom::geography, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography),
    g.power_type,
    COALESCE(g.name, 'Unknown')
  INTO v_distance, v_type, v_name
  FROM grid_features g
  WHERE g.power_type IN ('substation', 'line', 'minor_line', 'cable', 'transformer')
  ORDER BY g.geom <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  LIMIT 1;

  IF v_distance IS NULL THEN
    RETURN QUERY SELECT 'D'::TEXT, 99999.0, 'none'::TEXT, 'No grid found'::TEXT, 5000000.0;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    CASE
      WHEN v_distance <= 500 THEN 'A'
      WHEN v_distance <= 2000 THEN 'B'
      WHEN v_distance <= 5000 THEN 'C'
      ELSE 'D'
    END,
    v_distance,
    v_type,
    v_name,
    CASE
      WHEN v_distance <= 500 THEN 200000
      WHEN v_distance <= 2000 THEN 650000
      WHEN v_distance <= 5000 THEN 2000000
      ELSE 4000000
    END::DOUBLE PRECISION;
END;
$$ LANGUAGE plpgsql;

-- Find properties near grid within radius
CREATE OR REPLACE FUNCTION properties_near_grid(
  p_power_type TEXT,
  p_radius_m DOUBLE PRECISION DEFAULT 2000,
  p_region TEXT DEFAULT 'koh_phangan'
)
RETURNS TABLE (
  property_id TEXT,
  property_title TEXT,
  capacity_kwp DOUBLE PRECISION,
  distance_m DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.capacity_kwp,
    ST_Distance(p.geom::geography, g.geom::geography) as distance_m
  FROM properties p
  CROSS JOIN LATERAL (
    SELECT g2.geom
    FROM grid_features g2
    WHERE g2.power_type = p_power_type
      AND g2.region = p_region
    ORDER BY g2.geom <-> p.geom
    LIMIT 1
  ) g
  WHERE p.region = p_region
    AND ST_DWithin(p.geom::geography, g.geom::geography, p_radius_m)
  ORDER BY distance_m;
END;
$$ LANGUAGE plpgsql;
