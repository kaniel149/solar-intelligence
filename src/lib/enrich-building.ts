// Google Places API enrichment for building owner data

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || ''

export interface EnrichmentResult {
  name?: string
  phone?: string
  website?: string
  category?: string
  rating?: number
  address?: string
  placeId?: string
  types?: string[]
}

const TYPE_TO_CATEGORY: Record<string, string> = {
  lodging: 'hospitality',
  hotel: 'hospitality',
  resort: 'hospitality',
  restaurant: 'restaurant',
  cafe: 'restaurant',
  bar: 'restaurant',
  store: 'retail',
  shopping_mall: 'retail',
  supermarket: 'retail',
  school: 'education',
  university: 'education',
  hospital: 'health',
  doctor: 'health',
  pharmacy: 'health',
  place_of_worship: 'temple',
  local_government_office: 'government',
  gym: 'commercial',
  bank: 'commercial',
  gas_station: 'commercial',
  car_repair: 'industrial',
  factory: 'industrial',
}

function classifyCategory(types: string[]): string {
  for (const t of types) {
    if (TYPE_TO_CATEGORY[t]) return TYPE_TO_CATEGORY[t]
  }
  if (types.includes('point_of_interest') || types.includes('establishment')) return 'commercial'
  return 'residential'
}

// Nearby Search — finds businesses within radius of coordinates
export async function enrichFromPlaces(lat: number, lng: number): Promise<EnrichmentResult | null> {
  if (!PLACES_API_KEY) return null

  try {
    // Use CORS proxy or serverless function in production
    // For now, use the Places API directly (requires API key with Places enabled)
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=30&key=${PLACES_API_KEY}`

    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json()
    if (!data.results?.length) return null

    // Take the closest/most relevant result
    const place = data.results[0]

    // Get details for phone number
    let phone: string | undefined
    let website: string | undefined

    if (place.place_id) {
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,international_phone_number,website&key=${PLACES_API_KEY}`
      const detailRes = await fetch(detailUrl)
      if (detailRes.ok) {
        const detailData = await detailRes.json()
        phone = detailData.result?.international_phone_number?.replace(/\s/g, '')
        website = detailData.result?.website
      }
    }

    return {
      name: place.name,
      phone,
      website,
      category: classifyCategory(place.types || []),
      rating: place.rating,
      address: place.vicinity,
      placeId: place.place_id,
      types: place.types,
    }
  } catch (err) {
    console.error('Places enrichment failed:', err)
    return null
  }
}

// Batch enrichment using existing OpenStreetMap/Overture data (no API key needed)
export function enrichFromOSM(tags: Record<string, string>): Partial<EnrichmentResult> {
  return {
    name: tags.name || tags['name:en'] || tags['name:th'],
    phone: tags.phone || tags['contact:phone'],
    website: tags.website || tags['contact:website'],
    category: tags.tourism === 'hotel' ? 'hospitality'
      : tags.amenity === 'restaurant' ? 'restaurant'
      : tags.shop ? 'retail'
      : tags.amenity === 'school' ? 'education'
      : tags.amenity === 'hospital' ? 'health'
      : undefined,
  }
}

// Google Static Maps satellite image URL for a building
export function getSatelliteImageUrl(lat: number, lng: number, zoom = 19, size = '600x400'): string {
  if (!PLACES_API_KEY) {
    // Fallback to free MapLibre static image
    return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${zoom},0/${size}?access_token=pk.placeholder`
  }
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=satellite&key=${PLACES_API_KEY}`
}

export function isEnrichmentAvailable(): boolean {
  return !!PLACES_API_KEY
}
