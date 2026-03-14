// TM Energy CRM — 10-step Thai solar pipeline

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

export type LeadSource =
  | 'scanner'
  | 'manual'
  | 'facebook'
  | 'line'
  | 'referral'
  | 'cold'
  | 'walk_in'
  | 'organic'
  | 'website'
  | 'instagram'

export interface CrmProject {
  id: string
  client_name: string
  business_type: string | null
  client_phone: string | null
  client_email: string | null
  client_line_id: string | null
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

export type CrmProjectInsert = Partial<
  Omit<CrmProject, 'id' | 'created_at' | 'updated_at'>
> & {
  client_name: string
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
  labelTh: string
  labelShort: string
  color: string
  step: number
  checklist: ChecklistItem[]
}

// ── Checklist System ──
export interface ChecklistItem {
  id: string
  label: string
  labelTh: string
  required: boolean
}

export interface ProjectChecklist {
  id: string
  project_id: string
  checklist_item_id: string
  completed: boolean
  completed_at: string | null
  completed_by: string | null
}

// ── Thailand-adapted 10-step pipeline with checklists ──
export const CRM_STATUSES: StatusInfo[] = [
  {
    id: 'lead', label: 'Lead Capture', labelTh: 'รับลูกค้า', labelShort: 'Lead',
    color: '#3B82F6', step: 1,
    checklist: [
      { id: 'lead_contact', label: 'Contact info collected', labelTh: 'เก็บข้อมูลติดต่อ', required: true },
      { id: 'lead_source', label: 'Lead source identified', labelTh: 'ระบุแหล่งที่มา', required: false },
      { id: 'lead_visit', label: 'Site visit scheduled', labelTh: 'นัดดูหน้างาน', required: false },
    ],
  },
  {
    id: 'evaluation', label: 'Site Evaluation', labelTh: 'สำรวจพื้นที่', labelShort: 'Eval',
    color: '#8B5CF6', step: 2,
    checklist: [
      { id: 'eval_bill', label: 'Electricity bill collected', labelTh: 'เก็บบิลค่าไฟ', required: true },
      { id: 'eval_roof', label: 'Roof inspection done', labelTh: 'ตรวจสอบหลังคา', required: true },
      { id: 'eval_shade', label: 'Shading analysis', labelTh: 'วิเคราะห์เงา', required: false },
      { id: 'eval_phase', label: 'Electrical phase confirmed', labelTh: 'ยืนยันเฟสไฟฟ้า', required: true },
    ],
  },
  {
    id: 'proposal', label: 'Proposal', labelTh: 'เสนอราคา', labelShort: 'Proposal',
    color: '#F59E0B', step: 3,
    checklist: [
      { id: 'prop_design', label: 'System design complete', labelTh: 'ออกแบบระบบเสร็จ', required: true },
      { id: 'prop_finance', label: 'Financial model ready', labelTh: 'คำนวณการเงินเสร็จ', required: true },
      { id: 'prop_sent', label: 'Proposal sent to client', labelTh: 'ส่งใบเสนอราคา', required: true },
      { id: 'prop_followup', label: 'Follow-up call done', labelTh: 'โทรติดตาม', required: false },
    ],
  },
  {
    id: 'contract', label: 'Contract', labelTh: 'สัญญา', labelShort: 'Contract',
    color: '#10B981', step: 4,
    checklist: [
      { id: 'con_signed', label: 'Contract signed', labelTh: 'เซ็นสัญญา', required: true },
      { id: 'con_deposit', label: 'Deposit received', labelTh: 'รับเงินมัดจำ', required: true },
      { id: 'con_id', label: 'Client ID/passport copy', labelTh: 'สำเนาบัตรประชาชน/พาสปอร์ต', required: true },
    ],
  },
  {
    id: 'design', label: 'Detailed Design', labelTh: 'ออกแบบรายละเอียด', labelShort: 'Design',
    color: '#06B6D4', step: 5,
    checklist: [
      { id: 'des_eng', label: 'Engineering drawings', labelTh: 'แบบวิศวกรรม', required: true },
      { id: 'des_order', label: 'Equipment ordered', labelTh: 'สั่งอุปกรณ์', required: true },
      { id: 'des_permit', label: 'Building permit (if needed)', labelTh: 'ใบอนุญาตก่อสร้าง (ถ้าจำเป็น)', required: false },
    ],
  },
  {
    id: 'survey', label: 'Site Survey', labelTh: 'สำรวจหน้างาน', labelShort: 'Survey',
    color: '#EC4899', step: 6,
    checklist: [
      { id: 'sur_done', label: 'Survey completed', labelTh: 'สำรวจเสร็จ', required: true },
      { id: 'sur_photo', label: 'Site photos taken', labelTh: 'ถ่ายรูปหน้างาน', required: true },
      { id: 'sur_measure', label: 'Measurements recorded', labelTh: 'บันทึกการวัด', required: true },
    ],
  },
  {
    id: 'survey_approval', label: 'Design Approval', labelTh: 'อนุมัติแบบ', labelShort: 'Approval',
    color: '#F97316', step: 7,
    checklist: [
      { id: 'app_client', label: 'Client approved design', labelTh: 'ลูกค้าอนุมัติแบบ', required: true },
      { id: 'app_revisions', label: 'Revisions completed (if any)', labelTh: 'แก้ไขเสร็จ (ถ้ามี)', required: false },
    ],
  },
  {
    id: 'pea', label: 'PEA Submission', labelTh: 'ยื่น กฟภ.', labelShort: 'PEA',
    color: '#6366F1', step: 8,
    checklist: [
      { id: 'pea_app', label: 'PEA application submitted', labelTh: 'ยื่นคำร้อง กฟภ.', required: true },
      { id: 'pea_meter', label: 'Meter inspection scheduled', labelTh: 'นัดตรวจมิเตอร์', required: true },
      { id: 'pea_approve', label: 'PEA approval received', labelTh: 'ได้รับอนุมัติ กฟภ.', required: true },
      { id: 'pea_net_meter', label: 'Net metering agreement', labelTh: 'สัญญา Net Metering', required: false },
    ],
  },
  {
    id: 'installation', label: 'Installation', labelTh: 'ติดตั้ง', labelShort: 'Install',
    color: '#14B8A6', step: 9,
    checklist: [
      { id: 'ins_deliver', label: 'Equipment delivered', labelTh: 'อุปกรณ์ส่งถึง', required: true },
      { id: 'ins_mount', label: 'Panels mounted', labelTh: 'ติดตั้งแผง', required: true },
      { id: 'ins_wire', label: 'Wiring & inverter connected', labelTh: 'เดินสาย & ต่ออินเวอร์เตอร์', required: true },
      { id: 'ins_test', label: 'System testing passed', labelTh: 'ทดสอบระบบผ่าน', required: true },
    ],
  },
  {
    id: 'om', label: 'O&M', labelTh: 'บำรุงรักษา', labelShort: 'O&M',
    color: '#22C55E', step: 10,
    checklist: [
      { id: 'om_handover', label: 'Handover complete', labelTh: 'ส่งมอบงาน', required: true },
      { id: 'om_monitor', label: 'Monitoring connected', labelTh: 'เชื่อมต่อ Monitoring', required: true },
      { id: 'om_warranty', label: 'Warranty registered', labelTh: 'ลงทะเบียนรับประกัน', required: true },
      { id: 'om_payment', label: 'Final payment received', labelTh: 'รับเงินงวดสุดท้าย', required: true },
    ],
  },
]

export const STATUS_MAP = Object.fromEntries(
  CRM_STATUSES.map((s) => [s.id, s])
) as Record<ProjectStatus, StatusInfo>

// ── Thailand business types ──
export const BUSINESS_TYPES = [
  { id: 'resort', label: 'Resort', labelTh: 'รีสอร์ท' },
  { id: 'hotel', label: 'Hotel', labelTh: 'โรงแรม' },
  { id: 'villa', label: 'Villa', labelTh: 'วิลล่า' },
  { id: 'restaurant', label: 'Restaurant', labelTh: 'ร้านอาหาร' },
  { id: 'cafe', label: 'Café/Bar', labelTh: 'คาเฟ่/บาร์' },
  { id: 'factory', label: 'Factory', labelTh: 'โรงงาน' },
  { id: 'warehouse', label: 'Warehouse', labelTh: 'โกดัง' },
  { id: 'hospital', label: 'Hospital/Clinic', labelTh: 'โรงพยาบาล/คลินิก' },
  { id: 'school', label: 'School', labelTh: 'โรงเรียน' },
  { id: 'temple', label: 'Temple', labelTh: 'วัด' },
  { id: 'government', label: 'Government', labelTh: 'หน่วยงานราชการ' },
  { id: 'residential', label: 'Residential', labelTh: 'บ้านพักอาศัย' },
  { id: 'other', label: 'Other', labelTh: 'อื่นๆ' },
] as const

// ── Lead sources for Thailand ──
export const LEAD_SOURCES: { id: LeadSource; label: string; icon: string }[] = [
  { id: 'scanner', label: 'Roof Scanner', icon: '🛰️' },
  { id: 'line', label: 'LINE', icon: '💬' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'website', label: 'Website', icon: '🌐' },
  { id: 'referral', label: 'Referral', icon: '🤝' },
  { id: 'walk_in', label: 'Walk-in', icon: '🚶' },
  { id: 'cold', label: 'Cold Outreach', icon: '❄️' },
  { id: 'organic', label: 'Organic', icon: '🌱' },
  { id: 'manual', label: 'Manual Entry', icon: '✏️' },
]

// ── Pipeline filters ──
export interface PipelineFilters {
  search: string
  status: ProjectStatus | 'all'
  priority: ProjectPriority | 'all'
  source: string | 'all'
  businessType: string | 'all'
  dateRange: 'all' | '7d' | '30d' | '90d'
}

export const DEFAULT_FILTERS: PipelineFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  source: 'all',
  businessType: 'all',
  dateRange: 'all',
}

export interface CrmStats {
  total: number
  byStatus: Partial<Record<ProjectStatus, number>>
  totalKwp: number
  totalDealValue: number
  conversionRate: number
  urgentCount: number
}
