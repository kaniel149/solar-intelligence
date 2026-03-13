"""
Process Overture Maps building footprints for Ko Phangan.
Calculates solar potential for each building and merges with existing rich data.
"""
import json
import math
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

# Solar calculation constants (Thailand / Ko Phangan)
PANEL_AREA_M2 = 1.7          # Standard panel size
PANEL_WATT = 400              # 400W panels
USABLE_RATIO = 0.65           # 65% of roof usable after obstructions
PEAK_SUN_HOURS = 4.8          # Thailand avg ~4.8 kWh/m²/day
PERFORMANCE_RATIO = 0.82      # System losses (inverter, wiring, temp)
ANNUAL_KWH_PER_KWP = PEAK_SUN_HOURS * 365 * PERFORMANCE_RATIO  # ~1437
THB_PER_KWH = 4.5             # Average PEA tariff
EPC_COST_PER_KWP = 35000      # THB per kWp installed
MIN_AREA_M2 = 10              # Minimum building area
MAX_AREA_M2 = 50000           # Maximum reasonable building area


def polygon_area_m2(coords):
    """Calculate area in m² from lat/lng polygon using Shoelace formula."""
    if not coords:
        return 0
    # Handle nested ring structure: Polygon coords = [ring1, ring2, ...]
    # Each ring = [[lng, lat], ...]
    ring = coords
    if ring and isinstance(ring[0], (list, tuple)) and ring[0] and isinstance(ring[0][0], (list, tuple)):
        ring = ring[0]  # Extract first ring from [[ring]]
    n = len(ring)
    if n < 3:
        return 0

    center_lat = sum(c[1] for c in ring) / n
    lat_m = 111320
    lng_m = 111320 * math.cos(math.radians(center_lat))

    area = 0
    for i in range(n):
        j = (i + 1) % n
        xi = ring[i][0] * lng_m
        yi = ring[i][1] * lat_m
        xj = ring[j][0] * lng_m
        yj = ring[j][1] * lat_m
        area += xi * yj - xj * yi
    return abs(area) / 2


def centroid(coords):
    """Get centroid of polygon."""
    ring = coords
    if ring and isinstance(ring[0], (list, tuple)) and ring[0] and isinstance(ring[0][0], (list, tuple)):
        ring = ring[0]
    n = len(ring)
    if n == 0:
        return 0, 0
    lng = sum(c[0] for c in ring) / n
    lat = sum(c[1] for c in ring) / n
    return lat, lng


def classify_building(properties, area_m2):
    """Classify building type from Overture properties."""
    cls = (properties.get('class') or '').lower()
    subtype = (properties.get('subtype') or '').lower()

    # Try to determine from class
    if cls in ('hotel', 'resort'):
        return 'hospitality'
    if cls in ('retail', 'supermarket', 'shop'):
        return 'retail'
    if cls in ('temple', 'church', 'mosque'):
        return 'religious'
    if cls in ('school', 'university'):
        return 'education'
    if cls in ('hospital', 'clinic'):
        return 'healthcare'
    if cls in ('house', 'detached', 'bungalow', 'residential'):
        return 'residential'
    if cls in ('industrial', 'warehouse', 'factory'):
        return 'industrial'
    if cls == 'hut':
        return 'residential'

    # Classify by area
    if area_m2 > 500:
        return 'commercial'
    if area_m2 > 200:
        return 'mixed'
    return 'residential'


def calculate_solar_score(area_m2, category):
    """Calculate solar score 0-100 based on area and category."""
    # Base score from area (larger = more potential)
    if area_m2 >= 500:
        area_score = 85
    elif area_m2 >= 200:
        area_score = 70
    elif area_m2 >= 100:
        area_score = 55
    elif area_m2 >= 50:
        area_score = 40
    elif area_m2 >= 25:
        area_score = 30
    else:
        area_score = 20

    # Category bonus
    cat_bonus = {
        'commercial': 15, 'hospitality': 15, 'industrial': 12,
        'retail': 10, 'mixed': 8, 'education': 10,
        'healthcare': 10, 'government': 8, 'residential': 0,
        'religious': -5,
    }
    bonus = cat_bonus.get(category, 0)

    return max(5, min(100, area_score + bonus))


def calculate_priority(score):
    """A/B/C/D based on solar score."""
    if score >= 70:
        return 'A'
    if score >= 50:
        return 'B'
    if score >= 30:
        return 'C'
    return 'D'


def process_building(feature, existing_lookup):
    """Process a single building feature."""
    geom = feature.get('geometry', {})
    props = feature.get('properties', {})

    # Get coordinates
    geom_type = geom.get('type', '')
    coords = geom.get('coordinates', [])

    if geom_type == 'Polygon':
        area = polygon_area_m2(coords)
        lat, lng = centroid(coords)
    elif geom_type == 'MultiPolygon':
        # Use first polygon
        if coords:
            area = polygon_area_m2(coords[0])
            lat, lng = centroid(coords[0])
        else:
            return None
    elif geom_type == 'Point':
        lat, lng = coords[1], coords[0]
        area = 50  # Default for points
    else:
        return None

    # Filter
    if area < MIN_AREA_M2 or area > MAX_AREA_M2:
        return None
    if lat == 0 or lng == 0:
        return None

    # Check if we have existing rich data for this building
    overture_id = props.get('id', '')

    # Try to match by proximity to existing buildings
    match_key = f"{round(lat, 5)}_{round(lng, 5)}"
    existing = existing_lookup.get(match_key)

    if existing:
        # Use existing rich data but update area if we have better polygon
        return existing

    # Calculate solar metrics
    category = classify_building(props, area)
    usable = area * USABLE_RATIO
    panels = int(usable / PANEL_AREA_M2)
    kwp = round(panels * PANEL_WATT / 1000, 2)
    annual_kwh = round(kwp * ANNUAL_KWH_PER_KWP, 1)
    savings = round(annual_kwh * THB_PER_KWH)
    epc = round(kwp * EPC_COST_PER_KWP)
    score = calculate_solar_score(area, category)
    priority = calculate_priority(score)

    # Get name from Overture
    names = props.get('names') or {}
    name = ''
    if isinstance(names, dict):
        primary = names.get('primary', '')
        if primary:
            name = primary
    elif isinstance(names, str):
        name = names

    return {
        'id': f'roof_{overture_id[:20]}' if overture_id else f'roof_{abs(hash(f"{lat}{lng}"))}',
        'type': 'roof',
        'status': 'private',
        'region': 'koh_phangan',
        'title': name or 'Building',
        'location': 'Ko Phangan',
        'lat': round(lat, 7),
        'lng': round(lng, 7),
        'area': round(area, 1),
        'usableArea': round(usable, 1),
        'capacityKwp': kwp,
        'panelCount': panels,
        'annualKwh': annual_kwh,
        'annualSavings': savings,
        'epcCost': epc,
        'solarScore': score,
        'priority': priority,
        'category': category,
    }


def load_existing_buildings():
    """Load existing rich building data from GitHub-hosted buildings_data.js."""
    path = os.path.join(PROJECT_DIR, 'public', 'data', 'buildings_all.json')
    if not os.path.exists(path):
        print("No existing buildings_all.json found")
        return {}

    with open(path) as f:
        buildings = json.load(f)

    # Index by rounded lat/lng for proximity matching
    lookup = {}
    for b in buildings:
        key = f"{round(b['lat'], 5)}_{round(b['lng'], 5)}"
        lookup[key] = b

    print(f"Loaded {len(buildings)} existing buildings for matching")
    return lookup


def main():
    print("=== Overture Maps Building Processor ===\n")

    # Load Overture buildings
    overture_path = os.path.join(PROJECT_DIR, 'public', 'data', 'overture_buildings.geojson')
    with open(overture_path) as f:
        overture = json.load(f)

    features = overture.get('features', [])
    print(f"Overture buildings loaded: {len(features)}")

    # Load existing rich data
    existing = load_existing_buildings()

    # Process each building
    buildings = []
    skipped = 0
    matched = 0

    for i, feature in enumerate(features):
        result = process_building(feature, existing)
        if result:
            buildings.append(result)
            if result.get('annualKwh', 0) > 0 and result.get('solarScore', 0) > 0:
                pass
            if any(result.get('lat') == e.get('lat') and result.get('lng') == e.get('lng') for e in existing.values()):
                matched += 1
        else:
            skipped += 1

        if (i + 1) % 5000 == 0:
            print(f"  Processed {i+1}/{len(features)}...")

    print(f"\nResults:")
    print(f"  Total processed: {len(buildings)}")
    print(f"  Skipped (too small/large): {skipped}")
    print(f"  Matched with existing: {matched}")

    # Stats
    priorities = {}
    categories = {}
    total_kwp = 0
    for b in buildings:
        pr = b.get('priority', '?')
        priorities[pr] = priorities.get(pr, 0) + 1
        cat = b.get('category', 'unknown')
        categories[cat] = categories.get(cat, 0) + 1
        total_kwp += b.get('capacityKwp', 0)

    print(f"\nBy priority: {dict(sorted(priorities.items()))}")
    print(f"By category: {dict(sorted(categories.items(), key=lambda x: -x[1]))}")
    print(f"Total capacity: {total_kwp/1000:.1f} MWp")

    # Save output
    out_path = os.path.join(PROJECT_DIR, 'public', 'data', 'buildings_all.json')
    with open(out_path, 'w') as f:
        json.dump(buildings, f)

    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"\nSaved to {out_path} ({size_mb:.1f} MB, {len(buildings)} buildings)")


if __name__ == '__main__':
    main()
