import { useNavigate } from 'react-router-dom'
import { useDraggable } from '@dnd-kit/core'
import { Phone, Sun, DollarSign, MapPin, MessageCircle } from 'lucide-react'
import type { CrmProject } from '../../types/crm'
import { LEAD_SOURCES } from '../../types/crm'

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

interface LeadCardProps {
  project: CrmProject
  isDragging?: boolean
}

export function LeadCard({ project, isDragging }: LeadCardProps) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
  })

  const sourceInfo = LEAD_SOURCES.find((s) => s.id === project.source)

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        opacity: 0.5,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-full text-left bg-white/5 rounded-xl border border-white/10 p-3 hover:bg-white/[0.08] hover:border-white/20 transition-all group cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-2xl ring-2 ring-[#E8A820]/30' : ''
      }`}
    >
      {/* Top: Name + Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/crm/leads/${project.id}`)
            }}
            className="text-sm font-medium text-white truncate block group-hover:text-[#E8A820] transition-colors text-left w-full"
          >
            {project.client_name}
          </button>
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

      {/* Bottom: Source + Address + Quick Actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-[10px] text-white/30 flex-1 min-w-0">
          {sourceInfo && <span>{sourceInfo.icon}</span>}
          {project.property_address && (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin size={8} />
              {project.property_address}
            </span>
          )}
        </div>

        {/* Quick contact buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {project.client_line_id && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(`https://line.me/R/ti/p/${project.client_line_id}`, '_blank')
              }}
              className="p-1 rounded-md bg-[#00C300]/10 text-[#00C300] hover:bg-[#00C300]/20"
              title="LINE"
            >
              <MessageCircle size={10} />
            </button>
          )}
          {project.client_phone && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(`https://wa.me/${project.client_phone!.replace(/[^0-9]/g, '')}`, '_blank')
              }}
              className="p-1 rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
              title="WhatsApp"
            >
              <Phone size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
