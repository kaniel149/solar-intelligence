import type { SolarCalc, GridProximity, GridGrade } from '../types'

const PANEL_AREA_M2 = 2.0
const PANEL_WATT = 550
const PERFORMANCE_RATIO = 0.80
const EPC_COST_PER_KWP = 32000 // THB

export function calculateSolar(
  areaM2: number,
  irradiance: number,
  tariff: number,
  isRoof: boolean
): SolarCalc {
  const usablePct = isRoof ? 0.7 : 0.85
  const usableArea = areaM2 * usablePct
  const panelCount = Math.floor(usableArea / PANEL_AREA_M2)
  const capacityKwp = (panelCount * PANEL_WATT) / 1000
  const annualKwh = capacityKwp * irradiance * 365 * PERFORMANCE_RATIO
  const annualSavingsTHB = annualKwh * tariff
  const epcCost = capacityKwp * EPC_COST_PER_KWP
  const paybackYears = epcCost / annualSavingsTHB

  return {
    usableArea,
    panelCount,
    capacityKwp,
    annualKwh,
    annualSavingsTHB,
    epcCost,
    paybackYears,
  }
}

export function classifyGridGrade(distanceMeters: number): GridGrade {
  if (distanceMeters <= 500) return 'A'
  if (distanceMeters <= 2000) return 'B'
  if (distanceMeters <= 5000) return 'C'
  return 'D'
}

export function estimateConnectionCost(distanceMeters: number): number {
  if (distanceMeters <= 500) return 200000
  if (distanceMeters <= 2000) return 300000 + (distanceMeters - 500) * 500
  if (distanceMeters <= 5000) return 1000000 + (distanceMeters - 2000) * 700
  return 3000000 + (distanceMeters - 5000) * 1000
}

export function calculateGridProximity(
  propertyLng: number,
  propertyLat: number,
  gridFeatures: GeoJSON.FeatureCollection
): GridProximity {
  let minDistance = Infinity
  let nearestType = 'unknown'
  let nearestName = 'Unknown'

  for (const feature of gridFeatures.features) {
    const props = feature.properties as Record<string, string>
    const ptype = props?.power_type
    if (!ptype) continue

    // Prioritize substations and lines over towers/poles
    const coords = getFeatureCoordinates(feature)
    for (const [lng, lat] of coords) {
      const dist = haversineDistance(propertyLat, propertyLng, lat, lng)
      if (dist < minDistance) {
        minDistance = dist
        nearestType = ptype
        nearestName = props?.name || props?.['name:en'] || ptype
      }
    }
  }

  const grade = classifyGridGrade(minDistance)
  const estimatedConnectionCost = estimateConnectionCost(minDistance)

  return {
    grade,
    distanceMeters: Math.round(minDistance),
    nearestFeatureType: nearestType,
    nearestFeatureName: nearestName,
    estimatedConnectionCost,
  }
}

function getFeatureCoordinates(feature: GeoJSON.Feature): [number, number][] {
  const geom = feature.geometry
  if (geom.type === 'Point') {
    return [geom.coordinates as [number, number]]
  }
  if (geom.type === 'LineString') {
    return geom.coordinates as [number, number][]
  }
  if (geom.type === 'Polygon') {
    return geom.coordinates[0] as [number, number][]
  }
  if (geom.type === 'MultiLineString') {
    return geom.coordinates.flat() as [number, number][]
  }
  return []
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
