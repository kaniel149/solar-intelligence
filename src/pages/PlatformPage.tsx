import { useEffect, useState } from 'react'
import { SolarMap } from '../components/Map/SolarMap'
import { FilterBar } from '../components/FilterBar/FilterBar'
import { PropertySidebar } from '../components/Sidebar/PropertySidebar'
import { LoginModal } from '../components/Auth/LoginModal'
import { CRMPanel } from '../components/CRM/CRMPanel'
import { useAppStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { loadGridData, loadRoofData, loadLandData, enrichWithGridProximity } from '../lib/load-data'

export default function PlatformPage() {
  const setProperties = useAppStore((s) => s.setProperties)
  const setGridData = useAppStore((s) => s.setGridData)
  const setUser = useAppStore((s) => s.setUser)
  const [dataStatus, setDataStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setUser])

  useEffect(() => {
    async function init() {
      try {
        const grid = await loadGridData()
        setGridData(grid)
        const roofs = await loadRoofData()
        const lands = await loadLandData()
        const allProperties = [...roofs, ...lands]
        const enriched = enrichWithGridProximity(allProperties, grid)
        setProperties(enriched)
        setDataStatus('loaded')
      } catch (err) {
        console.error('Failed to load data:', err)
        setDataStatus('error')
      }
    }
    init()
  }, [setProperties, setGridData])

  return (
    <div className="platform-layout bg-[#0D2137] relative">
      <SolarMap />
      <FilterBar />
      <PropertySidebar />
      <CRMPanel />
      <LoginModal />

      {dataStatus === 'loading' && (
        <div className="absolute bottom-4 right-4 z-10 bg-[#0D2137]/90 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#E8A820] animate-pulse" />
          <span className="text-white/60 text-xs">Loading data...</span>
        </div>
      )}

      {dataStatus === 'error' && (
        <div className="absolute bottom-4 right-4 z-10 bg-[#0D2137]/90 backdrop-blur-xl rounded-xl border border-red-500/30 px-4 py-2 flex items-center gap-2">
          <span className="text-red-400 text-xs">Data loading failed — map only mode</span>
          <button onClick={() => window.location.reload()} className="text-[10px] text-[#E8A820] hover:underline">Retry</button>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 bg-[#0D2137]/90 backdrop-blur-xl rounded-xl border border-white/10 p-3">
        <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Legend</h4>
        <div className="space-y-1.5">
          <LegendItem shape="square" color="#2ED89A" label="Roof (Solar Potential)" />
          <LegendItem shape="circle" color="#E8A820" label="Land (For Sale)" />
          <LegendItem shape="line" color="#ff4444" label="Substation" />
          <LegendItem shape="line" color="#ff8800" label="Transmission Line" />
          <LegendItem shape="line" color="#ffcc00" label="Distribution Line" />
          <LegendItem shape="line" color="#00aaff" label="Submarine Cable" />
        </div>
      </div>
    </div>
  )
}

function LegendItem({ shape, color, label }: { shape: 'square' | 'circle' | 'line'; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {shape === 'square' && <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />}
      {shape === 'circle' && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />}
      {shape === 'line' && <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />}
      <span className="text-[10px] text-white/60">{label}</span>
    </div>
  )
}
