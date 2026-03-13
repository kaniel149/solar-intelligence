"""Merge existing rich building data (2,467 from buildings_data.js) with new Overture data (21,721)."""
import json
import math
import os
import urllib.request

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COPENHAGEN_SOLAR_BASE = 'https://kaniel149.github.io/copenhagen-solar'


def haversine(lat1, lng1, lat2, lng2):
    """Distance in meters between two points."""
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def main():
    # Load new Overture buildings
    overture_path = os.path.join(PROJECT_DIR, 'public', 'data', 'buildings_all.json')
    with open(overture_path) as f:
        overture = json.load(f)
    print(f"Overture buildings: {len(overture)}")

    # Download existing rich data from GitHub Pages
    print("Downloading existing buildings_data.js from GitHub Pages...")
    url = f'{COPENHAGEN_SOLAR_BASE}/roof-scanner/buildings_data.js'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    js_text = response.read().decode('utf-8')

    # Parse: "const B=[...];"\n → extract JSON array
    json_start = js_text.index('[')
    json_end = js_text.rindex(']')
    json_str = js_text[json_start:json_end + 1]
    existing_raw = json.loads(json_str)
    print(f"Existing rich buildings: {len(existing_raw)}")

    # Convert existing to our format (same as load-data.ts)
    existing = []
    for b in existing_raw:
        existing.append({
            'id': f"roof_{b['i']}",
            'type': 'roof',
            'status': 'private',
            'region': 'koh_phangan',
            'title': b.get('n') or 'Unknown Building',
            'location': 'Ko Phangan',
            'lat': b['la'],
            'lng': b['lo'],
            'area': b['a'],
            'usableArea': b['u'],
            'capacityKwp': b['kw'],
            'panelCount': b['p'],
            'annualKwh': b['kwh'],
            'annualSavings': b['sav'],
            'epcCost': b['epc'],
            'solarScore': b['s'],
            'priority': b['pr'],
            'category': b.get('c', ''),
            'phone': b.get('ph') or None,
            'website': b.get('w') or None,
            'email': b.get('em') or None,
            '_source': 'rich',
        })

    # Build spatial index for existing buildings
    existing_index = {}
    for b in existing:
        # Use grid cell (roughly 15m x 15m)
        key = (round(b['lat'] * 6000), round(b['lng'] * 6000))
        if key not in existing_index:
            existing_index[key] = []
        existing_index[key].append(b)

    # Merge: for each Overture building, check if there's a match in existing data
    merged = []
    matched = 0
    used_existing = set()

    for ob in overture:
        key = (round(ob['lat'] * 6000), round(ob['lng'] * 6000))
        best_match = None
        best_dist = 25  # Max 25m match distance

        # Check nearby cells
        for dk in range(-1, 2):
            for dl in range(-1, 2):
                check_key = (key[0] + dk, key[1] + dl)
                for eb in existing_index.get(check_key, []):
                    if id(eb) in used_existing:
                        continue
                    dist = haversine(ob['lat'], ob['lng'], eb['lat'], eb['lng'])
                    if dist < best_dist:
                        best_dist = dist
                        best_match = eb

        if best_match:
            # Use rich data but with Overture's potentially better area
            entry = dict(best_match)
            if ob['area'] > entry['area'] * 0.5:
                # Keep rich data as-is, it has better metrics
                pass
            entry.pop('_source', None)
            merged.append(entry)
            used_existing.add(id(best_match))
            matched += 1
        else:
            # New building from Overture
            merged.append(ob)

    # Add any unmatched existing buildings
    for eb in existing:
        if id(eb) not in used_existing:
            eb.pop('_source', None)
            merged.append(eb)

    print(f"\nMerge results:")
    print(f"  Matched (rich data kept): {matched}")
    print(f"  New from Overture: {len(overture) - matched}")
    print(f"  Unmatched existing added: {len(existing) - matched}")
    print(f"  Total merged: {len(merged)}")

    # Stats
    priorities = {}
    total_kwp = 0
    with_names = 0
    for b in merged:
        pr = b.get('priority', '?')
        priorities[pr] = priorities.get(pr, 0) + 1
        total_kwp += b.get('capacityKwp', 0)
        if b.get('title') and b['title'] not in ('Building', 'Unknown Building'):
            with_names += 1

    print(f"\nFinal stats:")
    print(f"  By priority: {dict(sorted(priorities.items()))}")
    print(f"  Total capacity: {total_kwp/1000:.1f} MWp")
    print(f"  Buildings with names: {with_names}")

    # Save
    out_path = os.path.join(PROJECT_DIR, 'public', 'data', 'buildings_all.json')
    with open(out_path, 'w') as f:
        json.dump(merged, f)

    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"\nSaved: {out_path} ({size_mb:.1f} MB)")


if __name__ == '__main__':
    main()
