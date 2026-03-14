import { useEffect, useState } from 'react'
import { Check, Circle, Lock } from 'lucide-react'
import { CRM_STATUSES } from '../../types/crm'
import type { CrmProject, ProjectChecklist, ChecklistItem } from '../../types/crm'
import { getProjectChecklists, toggleChecklistItem } from '../../lib/crm-service'

interface ChecklistPanelProps {
  project: CrmProject
}

export function ChecklistPanel({ project }: ChecklistPanelProps) {
  const [checklists, setChecklists] = useState<ProjectChecklist[]>([])
  const [loading, setLoading] = useState(true)

  const currentStepIdx = CRM_STATUSES.findIndex((s) => s.id === project.status)

  useEffect(() => {
    getProjectChecklists(project.id)
      .then(setChecklists)
      .finally(() => setLoading(false))
  }, [project.id])

  const isItemCompleted = (itemId: string) =>
    checklists.some((c) => c.checklist_item_id === itemId && c.completed)

  const handleToggle = async (itemId: string) => {
    const current = isItemCompleted(itemId)
    const success = await toggleChecklistItem(project.id, itemId, !current)
    if (success) {
      setChecklists((prev) => {
        const existing = prev.find((c) => c.checklist_item_id === itemId)
        if (existing) {
          return prev.map((c) =>
            c.checklist_item_id === itemId ? { ...c, completed: !current } : c
          )
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            project_id: project.id,
            checklist_item_id: itemId,
            completed: !current,
            completed_at: !current ? new Date().toISOString() : null,
            completed_by: null,
          },
        ]
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  // Show current stage + previous stage checklists
  const stagesToShow = CRM_STATUSES.filter((_, i) => i <= currentStepIdx)

  return (
    <div className="space-y-4">
      {stagesToShow.map((stage, stageIdx) => {
        const isCurrentStage = stage.id === project.status
        const completedCount = stage.checklist.filter((item) =>
          isItemCompleted(item.id)
        ).length
        const totalRequired = stage.checklist.filter((i) => i.required).length
        const completedRequired = stage.checklist
          .filter((i) => i.required)
          .filter((i) => isItemCompleted(i.id)).length
        const allRequiredDone = completedRequired >= totalRequired

        return (
          <div key={stage.id}>
            {/* Stage header */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: `${stage.color}20`,
                  color: stage.color,
                }}
              >
                {stage.step}
              </div>
              <span
                className={`text-xs font-semibold ${isCurrentStage ? 'text-white' : 'text-white/50'}`}
              >
                {stage.labelShort}
              </span>
              <span className="text-[9px] text-white/30">{stage.labelTh}</span>
              <span className="text-[10px] text-white/30 ml-auto">
                {completedCount}/{stage.checklist.length}
              </span>
              {allRequiredDone && !isCurrentStage && (
                <Check size={12} className="text-[#2ED89A]" />
              )}
            </div>

            {/* Checklist items */}
            <div className="space-y-1 ml-1">
              {stage.checklist.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  completed={isItemCompleted(item.id)}
                  disabled={stageIdx < currentStepIdx && isItemCompleted(item.id)}
                  color={stage.color}
                  onToggle={() => handleToggle(item.id)}
                />
              ))}
            </div>

            {/* Stage gate: show if current stage has uncompleted required items */}
            {isCurrentStage && !allRequiredDone && (
              <div className="mt-2 px-2 py-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center gap-2">
                <Lock size={10} className="text-[#F59E0B]" />
                <span className="text-[10px] text-[#F59E0B]">
                  Complete {totalRequired - completedRequired} required task{totalRequired - completedRequired > 1 ? 's' : ''} to advance
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ChecklistRow({
  item,
  completed,
  disabled,
  color,
  onToggle,
}: {
  item: ChecklistItem
  completed: boolean
  disabled: boolean
  color: string
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
        disabled
          ? 'opacity-40 cursor-default'
          : 'hover:bg-white/5 cursor-pointer'
      }`}
    >
      {completed ? (
        <div
          className="w-4 h-4 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}30` }}
        >
          <Check size={10} style={{ color }} />
        </div>
      ) : (
        <Circle size={16} className="text-white/20 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span
          className={`text-xs ${
            completed ? 'text-white/40 line-through' : 'text-white/70'
          }`}
        >
          {item.label}
        </span>
      </div>
      {item.required && !completed && (
        <span className="text-[8px] text-[#E85D3A] font-bold uppercase shrink-0">req</span>
      )}
    </button>
  )
}
