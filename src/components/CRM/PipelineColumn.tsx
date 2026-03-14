import { useDroppable } from '@dnd-kit/core'
import { LeadCard } from './LeadCard'
import type { CrmProject, StatusInfo } from '../../types/crm'

interface PipelineColumnProps {
  status: StatusInfo
  projects: CrmProject[]
  isActive?: boolean
}

export function PipelineColumn({ status, projects, isActive }: PipelineColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: status.id })

  return (
    <div className="min-w-[280px] max-w-[280px] flex flex-col h-full">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 mb-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: status.color }}
        />
        <span className="text-xs font-semibold text-white/70">{status.labelShort}</span>
        <span className="text-[9px] text-white/30">{status.labelTh}</span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-auto"
          style={{
            backgroundColor: `${status.color}20`,
            color: status.color,
          }}
        >
          {projects.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto space-y-2 px-1 pb-4 scrollbar-thin rounded-xl transition-all ${
          isOver
            ? 'bg-white/[0.06] ring-2 ring-inset ring-white/20'
            : isActive
              ? 'bg-white/[0.02]'
              : ''
        }`}
      >
        {projects.length === 0 ? (
          <div className={`text-center py-8 ${isActive ? 'border-2 border-dashed border-white/10 rounded-xl' : ''}`}>
            <p className="text-[11px] text-white/20">
              {isActive ? 'Drop here' : 'No projects'}
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <LeadCard key={project.id} project={project} />
          ))
        )}
      </div>

      {/* Checklist progress indicator */}
      {projects.length > 0 && (
        <div className="px-3 py-1.5 flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: '0%', // Populated when checklist data loads
                backgroundColor: status.color,
              }}
            />
          </div>
          <span className="text-[9px] text-white/20">{status.checklist.length} tasks</span>
        </div>
      )}
    </div>
  )
}
