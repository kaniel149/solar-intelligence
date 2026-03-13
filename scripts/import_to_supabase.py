"""Import buildings_all.json and grid_all.geojson into Supabase."""
import json
import os
import sys

# This script is meant to be run after Supabase project is created
# Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx python3 scripts/import_to_supabase.py

def main():
    supabase_url = os.environ.get('SUPABASE_URL')
    service_key = os.environ.get('SUPABASE_SERVICE_KEY')

    if not supabase_url or not service_key:
        print("Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")
        print("Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx python3 scripts/import_to_supabase.py")
        sys.exit(1)

    # Import via Supabase REST API
    import urllib.request

    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
    }

    # 1. Import buildings
    print("Loading buildings...")
    with open('public/data/buildings_all.json') as f:
        buildings = json.load(f)

    print(f"Importing {len(buildings)} buildings in batches...")
    batch_size = 500
    for i in range(0, len(buildings), batch_size):
        batch = buildings[i:i+batch_size]
        # Call the import_properties function
        payload = json.dumps({'p_data': batch}).encode()
        req = urllib.request.Request(
            f'{supabase_url}/rest/v1/rpc/import_properties',
            data=payload,
            headers=headers,
            method='POST'
        )
        try:
            resp = urllib.request.urlopen(req)
            print(f"  Batch {i//batch_size + 1}: {resp.read().decode()}")
        except Exception as e:
            print(f"  Error batch {i//batch_size + 1}: {e}")

    # 2. Import grid features
    print("\nLoading grid data...")
    with open('public/data/overture_buildings.geojson') as f:
        # Actually load grid data from the copenhagen-solar repo
        pass

    print("Grid import would need the grid_all.geojson file.")
    print("For now, grid data is loaded from GitHub Pages.")

    print("\nDone!")

if __name__ == '__main__':
    main()
