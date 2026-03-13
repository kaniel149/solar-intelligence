// TM Energy CRM — 10-step solar pipeline

export type ProjectStatus =
  | 'lead'
  | 'evaluation'
  | 'proposal'
  | 'contract'
  | 'design'
  | 'survey'
  | 'survey_approval'
  | 'pea'
  | 'installation'
  | 'om'

export type ProjectPriority = 'low' | 'normal' | 'high' | 'urgent'
export type DealType = 'epc' | 'ppa'

export interface CrmProject {
  id: string
  client_name: string
  business_type: string | null
  client_phone: string | null
  client_email: string | null
  property_address: string | null
  building_id: string | null
  lat: number | null
  lng: number | null
  status: ProjectStatus
  step_number: number
  priority: ProjectPriority
  system_size_kwp: number | null
  panel_count: number | null
  panel_model: string | null
  inverter_model: string | null
  battery_model: string | null
  annual_production: number | null
  deal_value: number | null
  deal_type: DealType | null
  monthly_consumption: number | null
  electricity_rate: number | null
  payback_years: number | null
  roof_type: string | null
  roof_condition: string | null
  roof_area_m2: number | null
  usable_area_m2: number | null
  roof_angle: number | null
  roof_direction: string | null
  electrical_phase: string | null
  shading_notes: string | null
  source: string | null
  assigned_to: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CrmProjectInsert {
  client_name: string
  business_type?: string
  client_phone?: string
  client_email?: string
  property_address?: string
  building_id?: string
  lat?: number
  lng?: number
  status?: ProjectStatus
  step_number?: number
  priority?: ProjectPriority
  system_size_kwp?: number
  panel_count?: number
  panel_model?: string
  inverter_model?: string
  battery_model?: string
  annual_production?: number
  deal_value?: number
  deal_type?: DealType
  monthly_consumption?: number
  electricity_rate?: number
  payback_years?: number
  roof_type?: string
  roof_condition?: string
  roof_area_m2?: number
  usable_area_m2?: number
  roof_angle?: number
  roof_direction?: string
  electrical_phase?: string
  shading_notes?: string
  source?: string
  assigned_to?: string
  notes?: string
  created_by?: string
}

export interface ActivityEntry {
  id: string
  project_id: string
  user_id: string | null
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string
  role: 'admin' | 'sales' | 'viewer'
  avatar_url: string | null
  created_at: string
}

export interface StatusInfo {
  id: ProjectStatus
  label: string
  labelShort: string
  color: string
  step: number
}

export const CRM_STATUSES: StatusInfo[] = [
  { id: 'lead',             label: 'Lead Capture',      labelShort: 'Lead',       color: '#3B82F6', step: 1 },
  { id: 'evaluation',       label: 'Evaluation',        labelShort: 'Eval',       color: '#8B5CF6', step: 2 },
  { id: 'proposal',         label: 'Proposal',          labelShort: 'Proposal',   color: '#F59E0B', step: 3 },
  { id: 'contract',         label: 'Contract',          labelShort: 'Contract',   color: '#10B981', step: 4 },
  { id: 'design',           label: 'Detailed Design',   labelShort: 'Design',     color: '#06B6D4', step: 5 },
  { id: 'survey',           label: 'Site Survey',       labelShort: 'Survey',     color: '#EC4899', step: 6 },
  { id: 'survey_approval',  label: 'Survey Approval',   labelShort: 'Approval',   color: '#F97316', step: 7 },
  { id: 'pea',              label: 'PEA Submission',    labelShort: 'PEA',        color: '#6366F1', step: 8 },
  { id: 'installation',     label: 'Installation',      labelShort: 'Install',    color: '#14B8A6', step: 9 },
  { id: 'om',               label: 'O&M',              labelShort: 'O&M',        color: '#22C55E', step: 10 },
]

export const STATUS_MAP = Object.fromEntries(
  CRM_STATUSES.map((s) => [s.id, s])
) as Record<ProjectStatus, StatusInfo>

export interface CrmStats {
  total: number
  byStatus: Partial<Record<ProjectStatus, number>>
  totalKwp: number
  totalDealValue: number
  conversionRate: number
  urgentCount: number
}
