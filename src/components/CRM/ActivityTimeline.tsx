import { Plus, ArrowRight, Edit3, FileText, Send, Clock } from 'lucide-react'
import { STATUS_MAP } from '../../types/crm'
import type { ActivityEntry } from '../../types/crm'
import type { LucideProps } from 'lucide-react'

type IconComponent = React.ComponentType<LucideProps>

const ACTION_CONFIG: Record<string, { icon: IconComponent; color: string; label: string }> = {
  lead_created:    { icon: Plus,       color: '#3B82F6', label: 'Lead created' },
  status_change:   { icon: ArrowRight, color: '#E8A820', label: 'Status changed' },
  project_updated: { icon: Edit3,      color: '#8B5CF6', label: 'Details updated' },
  note_added:      { icon: FileText,   color: '#06B6D4', label: 'Note added' },
  proposal_sent:   { icon: Send,       color: '#10B981', label: 'Proposal sent' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface ActivityTimelineProps {
  activities: ActivityEntry[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return <p className="text-white/30 text-sm text-center py-4">No activity yet</p>
  }

  return (
    <div className="space-y-0">
      {activities.map((a, i) => {
        const config = ACTION_CONFIG[a.action] ?? ACTION_CONFIG['project_updated']!
        const Icon = config.icon
        const isLast = i === activities.length - 1

        let description = config.label
        if (a.action === 'status_change' && a.details) {
          const status = a.details['status'] as string
          const info = STATUS_MAP[status as keyof typeof STATUS_MAP]
          if (info) description = `Moved to ${info.label}`
        }
        if (a.action === 'project_updated' && a.details?.['fields']) {
          const fields = a.details['fields'] as string[]
          description = `Updated: ${fields.join(', ')}`
        }

        return (
          <div key={a.id} className="flex gap-3">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Icon size={11} style={{ color: config.color }} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-white/10 my-1" />}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-xs text-white/70">{description}</p>
              <p className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1">
                <Clock size={8} />
                {timeAgo(a.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
