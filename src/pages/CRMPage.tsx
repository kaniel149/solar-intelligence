import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { getCrmProjects } from '../lib/crm-service'
import CRMLayout from '../components/CRM/CRMLayout'

export default function CRMPage() {
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const setCrmProjects = useAppStore((s) => s.setCrmProjects)
  const setCrmLoading = useAppStore((s) => s.setCrmLoading)
  const setShowLoginModal = useAppStore((s) => s.setShowLoginModal)
  const navigate = useNavigate()

  // Auth listener
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

  // Load CRM data when authenticated
  useEffect(() => {
    if (!user) return
    setCrmLoading(true)
    getCrmProjects()
      .then(setCrmProjects)
      .finally(() => setCrmLoading(false))
  }, [user, setCrmProjects, setCrmLoading])

  // Show login if not authenticated
  if (!user) {
    return (
      <div className="h-screen w-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#E8A820] to-[#E85D3A] flex items-center justify-center text-xl">⚡</div>
          <h1 className="text-xl font-bold text-white">TM Energy CRM</h1>
          <p className="text-white/40 text-sm">Sign in to access the CRM</p>
          <button
            onClick={() => {
              setShowLoginModal(true)
              navigate('/platform')
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8A820] to-[#E85D3A] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return <CRMLayout />
}
