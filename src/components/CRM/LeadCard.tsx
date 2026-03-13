import { useNavigate } from 'react-router-dom'
import { Phone, Sun, DollarSign, MapPin } from 'lucide-react'
import type { CrmProject } from '../../types/crm'

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

const SOURCE_ICONS: Record<string, string> = {
  scanner: '🛰️',
  facebook: '📘',
  referral: '🤝',
  cold: '❄️',
  walk_in: '🚶',
  organic: '🌱',
  manual: '✏️',
}

interface LeadCardProps {
  project: CrmProject
}

export function LeadCard({ project }: LeadCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/crm/leads/${project.id}`)}
      className="w-full text-left bg-white/5 rounded-xl border border-white/10 p-3 hover:bg-white/[0.08] hover:border-white/20 transition-all group"
    >
      {/* Top: Name + Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate group-hover:text-[#E8A820] transition-colors">
            {project.client_name}
          </h4>
          {project.business_type && (
            <p className="text-[10px] text-white/40 truncate mt-0.5">
              {project.business_type}
            </p>
          )}
        </div>
        {(project.priority === 'urgent' || project.priority === 'high') && (
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${PRIORITY_STYLES[project.priority]}`}
          >
            {project.priority.toUpperCase()}
          </span>
        )}
      </div>

      {/* Metrics row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/50">
        {project.system_size_kwp && (
          <span className="flex items-center gap-0.5">
            <Sun size={9} className="text-[#E8A820]" />
            {project.system_size_kwp} kWp
          </span>
        )}
        {project.deal_value && (
          <span className="flex items-center gap-0.5">
            <DollarSign size={9} className="text-[#2ED89A]" />
            ฿{(project.deal_value / 1000).toFixed(0)}K
          </span>
        )}
        {project.client_phone && (
          <span className="flex items-center gap-0.5">
            <Phone size={9} />
            {project.client_phone.slice(-4)}
          </span>
        )}
      </div>

      {/* Bottom: Source + Address */}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-white/30">
        {project.source && (
          <span>{SOURCE_ICONS[project.source] || '📋'}</span>
        )}
        {project.property_address && (
          <span className="flex items-center gap-0.5 truncate">
            <MapPin size={8} />
            {project.property_address}
          </span>
        )}
      </div>
    </button>
  )
}
