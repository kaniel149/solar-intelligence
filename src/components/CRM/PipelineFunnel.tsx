import { useNavigate } from 'react-router-dom'
import { CRM_STATUSES } from '../../types/crm'
import type { CrmStats } from '../../types/crm'

interface PipelineFunnelProps {
  stats: CrmStats
}

export function PipelineFunnel({ stats }: PipelineFunnelProps) {
  const navigate = useNavigate()
  const maxCount = Math.max(
    ...CRM_STATUSES.map((s) => stats.byStatus[s.id] || 0),
    1
  )

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Pipeline Overview</h3>
      <div className="space-y-2.5">
        {CRM_STATUSES.map((status) => {
          const count = stats.byStatus[status.id] || 0
          const pct = (count / maxCount) * 100

          return (
            <button
              key={status.id}
              onClick={() => navigate('/crm/pipeline')}
              className="w-full flex items-center gap-3 group hover:bg-white/5 rounded-lg px-2 py-1 transition-colors"
            >
              <span className="text-[11px] text-white/50 w-[70px] text-right shrink-0 group-hover:text-white/70">
                {status.labelShort}
              </span>
              <div className="flex-1 h-6 bg-white/5 rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md transition-all duration-500 flex items-center px-2"
                  style={{
                    width: `${Math.max(pct, count > 0 ? 8 : 0)}%`,
                    backgroundColor: `${status.color}40`,
                    borderLeft: count > 0 ? `3px solid ${status.color}` : 'none',
                  }}
                >
                  {count > 0 && (
                    <span className="text-[11px] font-bold" style={{ color: status.color }}>
                      {count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
