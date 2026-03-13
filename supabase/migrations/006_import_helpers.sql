-- Helper to bulk import properties from JSON
CREATE OR REPLACE FUNCTION import_properties(p_data JSONB)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_record JSONB;
BEGIN
  FOR v_record IN SELECT jsonb_array_elements(p_data)
  LOOP
    INSERT INTO properties (
      id, type, status, region, title, location, geom,
      area, usable_area, capacity_kwp, panel_count,
      annual_kwh, annual_savings, epc_cost, solar_score,
      priority, category, phone, website, email, source
    ) VALUES (
      v_record->>'id',
      COALESCE(v_record->>'type', 'roof'),
      COALESCE(v_record->>'status', 'private'),
      COALESCE(v_record->>'region', 'koh_phangan'),
      COALESCE(v_record->>'title', 'Building'),
      v_record->>'location',
      ST_SetSRID(ST_MakePoint(
        (v_record->>'lng')::DOUBLE PRECISION,
        (v_record->>'lat')::DOUBLE PRECISION
      ), 4326),
      (v_record->>'area')::DOUBLE PRECISION,
      (v_record->>'usableArea')::DOUBLE PRECISION,
      (v_record->>'capacityKwp')::DOUBLE PRECISION,
      (v_record->>'panelCount')::INTEGER,
      (v_record->>'annualKwh')::DOUBLE PRECISION,
      (v_record->>'annualSavings')::DOUBLE PRECISION,
      (v_record->>'epcCost')::DOUBLE PRECISION,
      (v_record->>'solarScore')::INTEGER,
      v_record->>'priority',
      v_record->>'category',
      v_record->>'phone',
      v_record->>'website',
      v_record->>'email',
      COALESCE(v_record->>'source', 'overture')
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      capacity_kwp = EXCLUDED.capacity_kwp,
      solar_score = EXCLUDED.solar_score,
      priority = EXCLUDED.priority,
      updated_at = now();
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
