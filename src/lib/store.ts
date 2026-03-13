import { create } from 'zustand'
import type { FilterState, Property, Region, ActiveTab } from '../types'

interface AppState {
  // Filters
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  setRegion: (region: Region) => void
  setActiveTab: (tab: ActiveTab) => void

  // Selection
  selectedProperty: Property | null
  setSelectedProperty: (property: Property | null) => void

  // Map
  mapStyle: 'satellite' | 'street'
  toggleMapStyle: () => void

  // Data
  properties: Property[]
  setProperties: (properties: Property[]) => void
  gridData: GeoJSON.FeatureCollection | null
  setGridData: (data: GeoJSON.FeatureCollection) => void

  // Stats
  stats: {
    totalProperties: number
    totalRoofs: number
    totalLands: number
    forSale: number
    avgSolarScore: number
    totalMwp: number
  }
  updateStats: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  filters: {
    activeTab: 'rooftops',
    region: 'koh_phangan',
    propertyType: 'all',
    status: 'all',
    gridGrade: 'all',
    priority: 'all',
    systemSize: 'all',
    categoryFilter: 'all',
    minSize: 0,
    maxSize: 100000,
    minPrice: 0,
    maxPrice: 200000000,
    minSolarScore: 0,
    showGrid: true,
    showBufferZones: true,
    searchQuery: '',
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setRegion: (region) =>
    set((state) => ({
      filters: { ...state.filters, region },
      selectedProperty: null,
    })),

  setActiveTab: (tab) =>
    set((state) => ({
      filters: {
        ...state.filters,
        activeTab: tab,
        propertyType: tab === 'rooftops' ? 'roof' : 'land',
      },
      selectedProperty: null,
    })),

  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),

  mapStyle: 'satellite',
  toggleMapStyle: () =>
    set((state) => ({
      mapStyle: state.mapStyle === 'satellite' ? 'street' : 'satellite',
    })),

  properties: [],
  setProperties: (properties) => {
    set({ properties })
    get().updateStats()
  },

  gridData: null,
  setGridData: (data) => set({ gridData: data }),

  stats: {
    totalProperties: 0,
    totalRoofs: 0,
    totalLands: 0,
    forSale: 0,
    avgSolarScore: 0,
    totalMwp: 0,
  },

  updateStats: () => {
    const { properties, filters } = get()
    const filtered = properties.filter((p) => p.region === filters.region)
    const roofs = filtered.filter((p) => p.type === 'roof')
    const lands = filtered.filter((p) => p.type === 'land')
    const forSale = filtered.filter((p) => p.status === 'sale')
    const scores = roofs.filter((p) => p.solarScore).map((p) => p.solarScore!)
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const totalMwp = roofs.reduce((sum, p) => sum + (p.capacityKwp || 0), 0) / 1000

    set({
      stats: {
        totalProperties: filtered.length,
        totalRoofs: roofs.length,
        totalLands: lands.length,
        forSale: forSale.length,
        avgSolarScore: Math.round(avgScore),
        totalMwp: Math.round(totalMwp * 10) / 10,
      },
    })
  },
}))
