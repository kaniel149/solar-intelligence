import { Users, DollarSign, Sun, TrendingUp } from 'lucide-react'
import type { CrmStats } from '../../types/crm'

interface KPICardsProps {
  stats: CrmStats
}

export function KPICards({ stats }: KPICardsProps) {
  const cards = [
    {
      icon: Users,
      label: 'Total Leads',
      value: stats.total.toString(),
      sub: undefined as string | undefined,
      color: '#3B82F6',
    },
    {
      icon: DollarSign,
      label: 'Pipeline Value',
      value: stats.totalDealValue > 0
        ? `฿${(stats.totalDealValue / 1000000).toFixed(1)}M`
        : '฿0',
      sub: undefined as string | undefined,
      color: '#E8A820',
    },
    {
      icon: Sun,
      label: 'Total kWp',
      value: stats.totalKwp > 0
        ? `${stats.totalKwp.toFixed(0)}`
        : '0',
      sub: undefined as string | undefined,
      color: '#2ED89A',
    },
    {
      icon: TrendingUp,
      label: 'Conversion',
      value: `${(stats.conversionRate * 100).toFixed(0)}%`,
      sub: 'contract+',
      color: '#10B981',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, label, value, sub, color }) => (
        <div
          key={label}
          className="bg-white/5 rounded-2xl border border-white/10 p-5 hover:bg-white/[0.07] transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
          </div>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-[11px] text-white/30 mt-1">{sub}</p>}
        </div>
      ))}
    </div>
  )
}
