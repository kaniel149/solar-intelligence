import { Plus, ArrowRight, Edit3, FileText, Send } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

type IconComponent = React.ComponentType<LucideProps>

export const ACTION_CONFIG: Record<string, { icon: IconComponent; color: string; label: string }> = {
  lead_created:    { icon: Plus,       color: '#3B82F6', label: 'Lead created' },
  status_change:   { icon: ArrowRight, color: '#E8A820', label: 'Status changed' },
  project_updated: { icon: Edit3,      color: '#8B5CF6', label: 'Details updated' },
  note_added:      { icon: FileText,   color: '#06B6D4', label: 'Note added' },
  proposal_sent:   { icon: Send,       color: '#10B981', label: 'Proposal sent' },
}

export function timeAgo(dateStr: string): string {
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
