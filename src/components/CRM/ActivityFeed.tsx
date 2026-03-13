import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, Edit3, Clock } from 'lucide-react'
import { getRecentActivity } from '../../lib/crm-service'
import { STATUS_MAP } from '../../types/crm'
import type { ActivityEntry, CrmProject } from '../../types/crm'

type ActivityWithProject = ActivityEntry & { project?: Pick<CrmProject, 'id' | 'client_name' | 'status'> }

const ACTION_CONFIG: Record<string, { icon: typeof Plus; color: string; label: string }> = {
  lead_created: { icon: Plus, color: '#3B82F6', label: 'New lead' },
  status_change: { icon: ArrowRight, color: '#E8A820', label: 'Moved' },
  project_updated: { icon: Edit3, color: '#8B5CF6', label: 'Updated' },
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

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityWithProject[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getRecentActivity(20)
      .then((data) => setActivities(data as ActivityWithProject[]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-8">No activity yet</p>
      ) : (
        <div className="space-y-1">
          {activities.map((a) => {
            const config = ACTION_CONFIG[a.action] ?? ACTION_CONFIG.project_updated
            const Icon = config.icon
            const projectName = a.project?.client_name ?? 'Unknown'
            const projectId = a.project?.id ?? a.project_id

            let description = `${config.label}: ${projectName}`
            if (a.action === 'status_change' && a.details) {
              const status = a.details.status as string
              const info = STATUS_MAP[status as keyof typeof STATUS_MAP]
              if (info) {
                description = `${projectName} → ${info.labelShort}`
              }
            }

            return (
              <button
                key={a.id}
                onClick={() => navigate(`/crm/leads/${projectId}`)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon size={12} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 truncate">{description}</p>
                </div>
                <span className="text-[10px] text-white/30 shrink-0 flex items-center gap-1">
                  <Clock size={9} />
                  {timeAgo(a.created_at)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
