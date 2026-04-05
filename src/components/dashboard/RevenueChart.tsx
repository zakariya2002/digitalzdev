import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Revenue, Project } from '../../types/database'

interface RevenueChartProps {
  revenues: Revenue[]
  projects: Project[]
}

export default function RevenueChart({ revenues, projects }: RevenueChartProps) {
  // Group revenues by month, stacked by project
  const monthMap = new Map<string, Record<string, number>>()

  revenues.forEach(r => {
    const monthKey = r.month.slice(0, 7) // YYYY-MM
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, {})
    const entry = monthMap.get(monthKey)!
    const projectName = projects.find(p => p.id === r.project_id)?.name || 'Autre'
    entry[projectName] = (entry[projectName] || 0) + Number(r.amount)
  })

  const data = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month: format(parseISO(month + '-01'), 'MMM yy', { locale: fr }),
      ...values,
    }))

  // Unique project names in revenues
  const projectNames = [...new Set(revenues.map(r =>
    projects.find(p => p.id === r.project_id)?.name || 'Autre'
  ))]
  const projectColors = Object.fromEntries(
    projects.map(p => [p.name, p.color])
  )

  if (data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Revenus mensuels</h3>
        <p className="text-sm text-gray-500 text-center py-8">Aucun revenu enregistré</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Revenus mensuels</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
            formatter={(value) => [`${Number(value).toFixed(2)} €`]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} />
          {projectNames.map(name => (
            <Bar
              key={name}
              dataKey={name}
              stackId="revenue"
              fill={projectColors[name] || '#6B7280'}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
