import { useState } from 'react'
import { Plus, Search, RefreshCw, X } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { getCrmProjects, createLead } from '../../lib/crm-service'
import { CRM_STATUSES } from '../../types/crm'
import type { CrmProject, CrmProjectInsert } from '../../types/crm'
import { PipelineColumn } from './PipelineColumn'

export default function Pipeline() {
  const crmProjects = useAppStore((s) => s.crmProjects)
  const setCrmProjects = useAppStore((s) => s.setCrmProjects)
  const crmLoading = useAppStore((s) => s.crmLoading)

  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showNewLead, setShowNewLead] = useState(false)

  const filtered = search
    ? crmProjects.filter(
        (p) =>
          p.client_name.toLowerCase().includes(search.toLowerCase()) ||
          p.property_address?.toLowerCase().includes(search.toLowerCase()) ||
          p.business_type?.toLowerCase().includes(search.toLowerCase())
      )
    : crmProjects

  // Group by status
  const byStatus: Record<string, CrmProject[]> = {}
  for (const status of CRM_STATUSES) {
    byStatus[status.id] = []
  }
  for (const p of filtered) {
    if (byStatus[p.status]) {
      byStatus[p.status].push(p)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    const projects = await getCrmProjects()
    setCrmProjects(projects)
    setRefreshing(false)
  }

  const handleNewLead = async (data: CrmProjectInsert) => {
    await createLead(data)
    setShowNewLead(false)
    await handleRefresh()
  }

  if (crmLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#E8A820] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Pipeline</h1>
          <p className="text-xs text-white/40 mt-0.5">{crmProjects.length} projects</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-[200px] pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={() => setShowNewLead(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8A820] to-[#E85D3A] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Lead
        </button>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 p-4 h-full min-w-min">
          {CRM_STATUSES.map((status) => (
            <PipelineColumn
              key={status.id}
              status={status}
              projects={byStatus[status.id] || []}
            />
          ))}
        </div>
      </div>

      {/* New Lead Modal */}
      {showNewLead && (
        <NewLeadModal
          onClose={() => setShowNewLead(false)}
          onSubmit={handleNewLead}
        />
      )}
    </div>
  )
}

// ── New Lead Modal ──
function NewLeadModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: CrmProjectInsert) => void
}) {
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [source, setSource] = useState('manual')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSubmit({
      client_name: name.trim(),
      business_type: businessType || undefined,
      client_phone: phone || undefined,
      client_email: email || undefined,
      property_address: address || undefined,
      source,
      status: 'lead',
      step_number: 1,
      priority: 'normal',
    })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0D2137] border border-white/10 rounded-2xl w-[440px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">New Lead</h2>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field
            label="Business Name *"
            value={name}
            onChange={setName}
            placeholder="e.g. Coconut Beach Resort"
          />
          <Field
            label="Business Type"
            value={businessType}
            onChange={setBusinessType}
            placeholder="e.g. resort, restaurant, villa"
          />
          <Field
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="+66 77 428 999"
          />
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="contact@business.com"
          />
          <Field
            label="Address"
            value={address}
            onChange={setAddress}
            placeholder="123 Moo 5, Koh Phangan"
          />

          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-1.5">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/20 [&>option]:bg-[#0D2137]"
            >
              <option value="manual">Manual Entry</option>
              <option value="scanner">Roof Scanner</option>
              <option value="facebook">Facebook Ad</option>
              <option value="referral">Referral</option>
              <option value="cold">Cold Outreach</option>
              <option value="walk_in">Walk-in</option>
              <option value="organic">Organic</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E8A820] to-[#E85D3A] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
      />
    </div>
  )
}
