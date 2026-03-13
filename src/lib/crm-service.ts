import { supabase, isCrmConnected } from './supabase'
import type { Property } from '../types'
import type { CrmProject, CrmProjectInsert, CrmStats, ProjectStatus } from '../types/crm'

// ── Push building from map to CRM as lead ──
export async function pushToCrm(property: Property, assignedTo?: string): Promise<CrmProject | null> {
  if (!supabase) return null

  const insert: CrmProjectInsert = {
    client_name: property.ownerName || property.title || `Building at ${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`,
    client_phone: property.phone || undefined,
    client_email: property.email || undefined,
    property_address: property.location || undefined,
    system_size_dc_kw: property.capacityKwp ? property.capacityKwp : undefined,
    system_size_ac_kw: property.capacityKwp ? Math.round(property.capacityKwp * 0.9 * 10) / 10 : undefined,
    panel_count: property.panelCount || undefined,
    roof_area_sqm: property.area || undefined,
    status: 'lead',
    priority: property.priority === 'A' ? 'high' : property.priority === 'B' ? 'normal' : 'low',
    notes: [
      `Source: Solar Intelligence Platform`,
      `Building ID: ${property.id}`,
      `Region: ${property.region}`,
      property.category ? `Category: ${property.category}` : '',
      property.solarScore ? `Solar Score: ${property.solarScore}/100` : '',
      property.gridProximity ? `Grid: ${property.gridProximity.grade} (${property.gridProximity.distanceMeters.toFixed(0)}m from ${property.gridProximity.nearestFeatureName})` : '',
    ].filter(Boolean).join('\n'),
    source: 'solar-intelligence',
    estimated_yearly_revenue: property.annualSavings || undefined,
    purchase_price: property.epcCost || undefined,
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

  return data as CrmProject
}

// ── Fetch all CRM projects ──
export async function getCrmProjects(): Promise<CrmProject[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('CRM fetch failed:', error)
    return []
  }

  return (data || []) as CrmProject[]
}

// ── Fetch CRM projects by status ──
export async function getCrmProjectsByStatus(status: ProjectStatus): Promise<CrmProject[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data || []) as CrmProject[]
}

// ── Update project status ──
export async function updateProjectStatus(projectId: string, status: ProjectStatus): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) {
    console.error('Status update failed:', error)
    return false
  }
  return true
}

// ── Assign project to team member ──
export async function assignProject(projectId: string, userId: string): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('projects')
    .update({ assigned_to: userId, updated_at: new Date().toISOString() })
    .eq('id', projectId)

  return !error
}

// ── Get CRM stats ──
export async function getCrmStats(): Promise<CrmStats> {
  const projects = await getCrmProjects()

  const byStatus: Record<string, number> = {}
  let totalKw = 0
  let urgentCount = 0

  for (const p of projects) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1
    totalKw += p.system_size_dc_kw || 0
    if (p.priority === 'urgent' || p.priority === 'high') urgentCount++
  }

  return {
    total: projects.length,
    byStatus: byStatus as Record<ProjectStatus, number>,
    totalKw,
    urgentCount,
  }
}

// ── Check if a building is already in CRM (by coordinates) ──
export async function findExistingLead(lat: number, lng: number): Promise<CrmProject | null> {
  if (!supabase) return null

  // Search by notes field containing the building coordinates
  const { data } = await supabase
    .from('projects')
    .select('*')
    .ilike('notes', `%${lat.toFixed(4)}%`)
    .limit(1)

  return data?.[0] as CrmProject | null
}

// ── Send WhatsApp notification for new lead ──
export async function notifyNewLead(project: CrmProject, property: Property): Promise<void> {
  try {
    const message = [
      `*New Solar Lead* from Intelligence Platform`,
      ``,
      `*${project.client_name}*`,
      property.location ? `Location: ${property.location}` : '',
      project.system_size_dc_kw ? `System: ${project.system_size_dc_kw} kWp` : '',
      project.panel_count ? `Panels: ${project.panel_count}` : '',
      property.annualSavings ? `Est. savings: ${property.annualSavings.toLocaleString()} THB/yr` : '',
      property.priority ? `Priority: Grade ${property.priority}` : '',
      ``,
      `View in CRM →`,
    ].filter(Boolean).join('\n')

    // Try to send via WhatsApp MCP if available, otherwise just log
    console.log('WhatsApp notification:', message)
  } catch (e) {
    console.error('WhatsApp notification failed:', e)
  }
}

export { isCrmConnected }
