export interface NasaPowerData {
  annualGHI: number      // kWh/m²/day annual average
  monthlyGHI: number[]   // 12 monthly values (Jan–Dec)
  annualTemp: number     // Average temperature °C
  bestMonth: string      // Month name with highest irradiance
  worstMonth: string     // Month name with lowest irradiance
}

const MONTH_KEYS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December']

// Cache by rounded lat/lng (0.1° grid ≈ 11 km)
const cache = new Map<string, NasaPowerData>()

function roundCoord(n: number): number {
  return Math.round(n * 10) / 10
}

function cacheKey(lat: number, lng: number): string {
  return `${roundCoord(lat)},${roundCoord(lng)}`
}

export async function fetchSolarIrradiance(lat: number, lng: number): Promise<NasaPowerData> {
  const key = cacheKey(lat, lng)
  const cached = cache.get(key)
  if (cached) return cached

  const roundedLat = roundCoord(lat)
  const roundedLng = roundCoord(lng)

  const params = new URLSearchParams({
    parameters: 'ALLSKY_SFC_SW_DWN,T2M',
    community: 'RE',
    longitude: String(roundedLng),
    latitude: String(roundedLat),
    format: 'JSON',
    start: '2001',
    end: '2020',
  })

  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?${params.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`NASA POWER API error: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()
  const ghi = json?.properties?.parameter?.ALLSKY_SFC_SW_DWN as Record<string, number> | undefined
  const t2m = json?.properties?.parameter?.T2M as Record<string, number> | undefined

  if (!ghi) {
    throw new Error('NASA POWER API: missing ALLSKY_SFC_SW_DWN in response')
  }

  const monthlyGHI = MONTH_KEYS.map((k) => ghi[k] ?? 0)
  const annualGHI = ghi['ANN'] ?? monthlyGHI.reduce((a, b) => a + b, 0) / 12
  const annualTemp = t2m ? (t2m['ANN'] ?? 0) : 0

  const maxIdx = monthlyGHI.indexOf(Math.max(...monthlyGHI))
  const minIdx = monthlyGHI.indexOf(Math.min(...monthlyGHI))

  const result: NasaPowerData = {
    annualGHI,
    monthlyGHI,
    annualTemp,
    bestMonth: MONTH_NAMES[maxIdx],
    worstMonth: MONTH_NAMES[minIdx],
  }

  cache.set(key, result)
  return result
}
