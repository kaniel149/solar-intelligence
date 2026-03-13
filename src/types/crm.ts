// Matches Solaris CRM project schema (005_create_projects_table.sql)

export type ProjectStatus =
  | 'lead'
  | 'onboarding'
  | 'licensing'
  | 'measurements'
  | 'ordering'
  | 'installation'
  | 'iec_sync'
  | 'grid_connection'
  | 'monitoring'
  | 'cemetery'

export type ProjectPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface CrmProject {
  id: string
  client_name: string
  client_phone: string | null
  client_email: string | null
  client_address: string | null
  property_address: string | null
  system_size_dc_kw: number | null
  panel_count: number | null
  roof_area_sqm: number | null
  status: ProjectStatus
  priority: ProjectPriority
  assigned_to: string | null
  notes: string | null
  lat: number | null
  lng: number | null
  source: string | null
  created_at: string
  updated_at: string
}

export interface CrmProjectInsert {
  client_name: string
  client_phone?: string
  client_email?: string
  client_address?: string
  property_address?: string
  system_size_dc_kw?: number
  system_size_ac_kw?: number
  panel_count?: number
  roof_area_sqm?: number
  status: ProjectStatus
  priority: ProjectPriority
  notes?: string
  source?: string
  // Custom fields for Solar Intelligence
  estimated_yearly_revenue?: number
  purchase_price?: number
}

export interface StatusInfo {
  id: ProjectStatus
  label: string
  labelShort: string
  color: string
  order: number
}

export const CRM_STATUSES: StatusInfo[] = [
  { id: 'lead', label: 'Lead + Proposal', labelShort: 'Lead', color: '#6366f1', order: 1 },
  { id: 'onboarding', label: 'Onboarding + Contract', labelShort: 'Onboarding', color: '#8b5cf6', order: 2 },
  { id: 'licensing', label: 'Permits + Confirm PV', labelShort: 'Permits', color: '#ec4899', order: 3 },
  { id: 'measurements', label: 'Measurements + Design', labelShort: 'Measure', color: '#f97316', order: 4 },
  { id: 'ordering', label: 'Equipment Ordering', labelShort: 'Ordering', color: '#eab308', order: 5 },
  { id: 'installation', label: 'Installation', labelShort: 'Install', color: '#22c55e', order: 6 },
  { id: 'iec_sync', label: 'Sync + Inspections', labelShort: 'Sync', color: '#0ea5e9', order: 7 },
  { id: 'grid_connection', label: 'Grid Connection', labelShort: 'Grid', color: '#3b82f6', order: 8 },
  { id: 'monitoring', label: 'Monitoring', labelShort: 'Monitor', color: '#10b981', order: 9 },
  { id: 'cemetery', label: 'Cemetery', labelShort: 'Cemetery', color: '#6b7280', order: 99 },
]

export interface CrmStats {
  total: number
  byStatus: Record<ProjectStatus, number>
  totalKw: number
  urgentCount: number
}
