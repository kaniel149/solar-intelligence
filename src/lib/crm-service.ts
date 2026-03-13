import { supabase, isCrmConnected } from './supabase'
import type { Property } from '../types'
import type {
  CrmProject,
  CrmProjectInsert,
  CrmStats,
  ProjectStatus,
  ActivityEntry,
} from '../types/crm'

// ── Push building from scanner to CRM ──
export async function pushToCrm(property: Property): Promise<CrmProject | null> {
  if (!supabase) return null

  const insert: CrmProjectInsert = {
    client_name: property.ownerName || property.title || `Building at ${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`,
    business_type: property.category || undefined,
    client_phone: property.phone || undefined,
    client_email: property.email || undefined,
    property_address: property.location || undefined,
    building_id: property.id,
    lat: property.lat,
    lng: property.lng,
    status: 'lead',
    step_number: 1,
    priority: property.priority === 'A' ? 'high' : property.priority === 'B' ? 'normal' : 'low',
    system_size_kwp: property.capacityKwp || undefined,
    panel_count: property.panelCount || undefined,
    roof_area_m2: property.area || undefined,
    usable_area_m2: property.area ? property.area * 0.7 : undefined,
    source: 'scanner',
    notes: [
      `Source: Solar Intelligence Scanner`,
      `Region: ${property.region}`,
      property.solarScore ? `Solar Score: ${property.solarScore}/100` : '',
      property.gridProximity ? `Grid: ${property.gridProximity.grade} (${property.gridProximity.distanceMeters.toFixed(0)}m)` : '',
    ].filter(Boolean).join('\n'),
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(insert)
    .select()
    .single()

  if (error) {
    console.error('CRM push failed:', error)
    throw new Error(error.message)
  }

  if (data) {
    await logActivity(data.id, 'lead_created', {
      source: 'scanner',
      building_id: property.id,
    })
  }

  return data as CrmProject
}

// ── Create lead manually ──
export async function createLead(data: CrmProjectInsert): Promise<CrmProject | null> {
  if (!supabase) return null

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ ...data, status: data.status || 'lead', step_number: data.step_number || 1 })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (project) {
    await logActivity(project.id, 'lead_created', { source: data.source || 'manual' })
  }

  return project as CrmProject
}

// ── Fetch all CRM projects ──
export async function getCrmProjects(): Promise<CrmProject[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('step_number', { ascending: true })
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('CRM fetch failed:', error)
    return []
  }

  return (data || []) as CrmProject[]
}

// ── Fetch single project ──
export async function getCrmProject(id: string): Promise<CrmProject | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as CrmProject
}

// ── Update project status (move in pipeline) ──
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  stepNumber: number
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('projects')
    .update({ status, step_number: stepNumber })
    .eq('id', projectId)

  if (error) {
    console.error('Status update failed:', error)
    return false
  }

  await logActivity(projectId, 'status_change', { status, step_number: stepNumber })
  return true
}

// ── Update project fields ──
export async function updateProject(
  projectId: string,
  updates: Partial<CrmProjectInsert>
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)

  if (error) {
    console.error('Project update failed:', error)
    return false
  }

  await logActivity(projectId, 'project_updated', { fields: Object.keys(updates) })
  return true
}

// ── Delete project ──
export async function deleteProject(projectId: string): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  return !error
}

// ── Activity log ──
export async function logActivity(
  projectId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  if (!supabase) return

  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('activity_log').insert({
    project_id: projectId,
    user_id: user?.id || null,
    action,
    details: details || null,
  })
}

export async function getProjectActivity(projectId: string): Promise<ActivityEntry[]> {
  if (!supabase) return []

  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data || []) as ActivityEntry[]
}

export async function getRecentActivity(limit = 20): Promise<(ActivityEntry & { project?: CrmProject })[]> {
  if (!supabase) return []

  const { data } = await supabase
    .from('activity_log')
    .select('*, project:projects(id, client_name, status)')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data || []) as (ActivityEntry & { project?: CrmProject })[]
}

// ── Stats ──
export async function getCrmStats(): Promise<CrmStats> {
  const projects = await getCrmProjects()

  const byStatus: Partial<Record<ProjectStatus, number>> = {}
  let totalKwp = 0
  let totalDealValue = 0
  let urgentCount = 0
  let contractOrBeyond = 0

  for (const p of projects) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1
    totalKwp += p.system_size_kwp || 0
    totalDealValue += p.deal_value || 0
    if (p.priority === 'urgent' || p.priority === 'high') urgentCount++
    if (p.step_number >= 4) contractOrBeyond++
  }

  return {
    total: projects.length,
    byStatus,
    totalKwp,
    totalDealValue,
    conversionRate: projects.length > 0 ? contractOrBeyond / projects.length : 0,
    urgentCount,
  }
}

// ── Find by building ID ──
export async function findByBuildingId(buildingId: string): Promise<CrmProject | null> {
  if (!supabase) return null

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('building_id', buildingId)
    .limit(1)

  return (data?.[0] as CrmProject) || null
}

export { isCrmConnected }
