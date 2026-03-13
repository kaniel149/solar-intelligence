import { LeadCard } from './LeadCard'
import type { CrmProject, StatusInfo } from '../../types/crm'

interface PipelineColumnProps {
  status: StatusInfo
  projects: CrmProject[]
}

export function PipelineColumn({ status, projects }: PipelineColumnProps) {
  return (
    <div className="min-w-[280px] max-w-[280px] flex flex-col h-full">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 mb-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: status.color }}
        />
        <span className="text-xs font-semibold text-white/70">{status.labelShort}</span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
          style={{
            backgroundColor: `${status.color}20`,
            color: status.color,
          }}
        >
          {projects.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1 pb-4 scrollbar-thin">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[11px] text-white/20">No projects</p>
          </div>
        ) : (
          projects.map((project) => (
            <LeadCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  )
}
