import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { formatCurrency, calculateCharges, BUSINESS } from '../../lib/business'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Invoice } from '../../types/database'

export default function FinancesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .in('status', ['paid', 'partial', 'sent', 'overdue'])
      .order('paid_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
    } else {
      setInvoices((data || []) as Invoice[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // --- Computed data ---

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const yearStart = startOfYear(now)
  const yearEnd = endOfYear(now)

  // Only paid/partial invoices for revenue calculations
  const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.status === 'partial')

  // CA encaisse du mois
  const monthCA = paidInvoices
    .filter(inv => {
      if (!inv.paid_at) return false
      const d = new Date(inv.paid_at)
      return d >= monthStart && d <= monthEnd
    })
    .reduce((sum, inv) => sum + (inv.paid_amount || 0), 0)

  // CA encaisse de l'annee
  const yearCA = paidInvoices
    .filter(inv => {
      if (!inv.paid_at) return false
      const d = new Date(inv.paid_at)
      return d.getFullYear() === currentYear
    })
    .reduce((sum, inv) => sum + (inv.paid_amount || 0), 0)

  const yearCharges = calculateCharges(yearCA)
  const plafondPercent = Math.min((yearCA / BUSINESS.caPlafond) * 100, 100)

  // Factures en attente
  const pendingCount = invoices.filter(
    inv => inv.status === 'sent' || inv.status === 'partial' || inv.status === 'overdue'
  ).length

  // Monthly breakdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthInvoices = paidInvoices.filter(inv => {
      if (!inv.paid_at) return false
      const d = new Date(inv.paid_at)
      return d.getFullYear() === currentYear && d.getMonth() === i
    })
    const ca = monthInvoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0)
    const charges = calculateCharges(ca)
    return {
      month: format(new Date(currentYear, i, 1), 'MMM', { locale: fr }),
      monthFull: format(new Date(currentYear, i, 1), 'MMMM yyyy', { locale: fr }),
      monthIndex: i,
      ca,
      urssaf: charges.urssaf,
      cfp: charges.cfp,
      totalCharges: charges.totalCharges,
      net: charges.net,
    }
  })

  const totalCA = months.reduce((s, m) => s + m.ca, 0)
  const totalChargesAll = months.reduce((s, m) => s + m.totalCharges, 0)
  const totalNet = months.reduce((s, m) => s + m.net, 0)
  const totalUrssaf = months.reduce((s, m) => s + m.urssaf, 0)
  const totalCfp = months.reduce((s, m) => s + m.cfp, 0)

  const kpis = [
    {
      label: 'CA encaisse du mois',
      value: formatCurrency(monthCA),
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: `CA encaisse ${currentYear}`,
      value: formatCurrency(yearCA),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Charges URSSAF estimees',
      value: formatCurrency(yearCharges.totalCharges),
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      label: 'Revenu net estime',
      value: formatCurrency(yearCharges.net),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Progression plafond',
      value: `${plafondPercent.toFixed(1)}%`,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      showBar: true,
      barPercent: plafondPercent,
    },
    {
      label: 'Factures en attente',
      value: String(pendingCount),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ]

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-white mb-1 capitalize">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name} : {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Year selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Finances</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentYear(y => y - 1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-white min-w-[60px] text-center">{currentYear}</span>
          <button
            onClick={() => setCurrentYear(y => y + 1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`${kpi.bg} border ${kpi.border} rounded-xl p-4`}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            {kpi.showBar && (
              <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(kpi.barPercent || 0, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Revenus mensuels {currentYear}</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
                tickLine={{ stroke: '#4B5563' }}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
                tickLine={{ stroke: '#4B5563' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }}
              />
              <Bar dataKey="ca" name="CA brut" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalCharges" name="Charges" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly recap table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Recap mensuel {currentYear}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">CA brut</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">URSSAF (21,1%)</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">CFP (0,1%)</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total charges</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {months.map((m) => {
                const isCurrentMonth =
                  m.monthIndex === now.getMonth() && currentYear === now.getFullYear()
                return (
                  <tr
                    key={m.monthIndex}
                    className={`${
                      isCurrentMonth
                        ? 'bg-blue-500/10 border-l-2 border-l-blue-500'
                        : 'hover:bg-gray-800/50'
                    } transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-300 capitalize">{m.monthFull}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-white">
                      {m.ca > 0 ? formatCurrency(m.ca) : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-400">
                      {m.urssaf > 0 ? formatCurrency(m.urssaf) : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-400">
                      {m.cfp > 0 ? formatCurrency(m.cfp) : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-400">
                      {m.totalCharges > 0 ? formatCurrency(m.totalCharges) : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">
                      {m.net > 0 ? formatCurrency(m.net) : <span className="text-gray-600">-</span>}
                    </td>
                  </tr>
                )
              })}
              {/* Total row */}
              <tr className="bg-gray-800/80 border-t-2 border-gray-700">
                <td className="px-4 py-3 text-sm font-bold text-white">Total {currentYear}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-white">{formatCurrency(totalCA)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-red-400">{formatCurrency(totalUrssaf)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-red-400">{formatCurrency(totalCfp)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-red-400">{formatCurrency(totalChargesAll)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-emerald-400">{formatCurrency(totalNet)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
