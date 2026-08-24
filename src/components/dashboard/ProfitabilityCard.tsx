import { formatCurrency } from '../../lib/business'
import type { Project } from '../../types/database'

const DEFAULT_HOURLY_RATE = 50

interface ProfitabilityCardProps {
  project: Project
  hoursSpent: number
  collected: number
}

/** Répond à « ce projet nous a-t-il rapporté ? » en confrontant budget, temps passé et encaissements. */
export default function ProfitabilityCard({ project, hoursSpent, collected }: ProfitabilityCardProps) {
  const rate = Number(project.hourly_rate) || DEFAULT_HOURLY_RATE
  const budget = Number(project.budget) || 0
  const cost = hoursSpent * rate
  const margin = budget - cost
  const marginRate = budget > 0 ? Math.round((margin / budget) * 100) : null
  const effectiveRate = hoursSpent > 0 ? budget / hoursSpent : null
  const budgetUsed = budget > 0 ? Math.min(100, Math.round((cost / budget) * 100)) : 0
  const over = budget > 0 && cost > budget

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Rentabilité</h3>
        <span className="text-xs text-gray-500">{rate} €/h · {hoursSpent.toFixed(1)}h passées</span>
      </div>

      {budget === 0 ? (
        <p className="text-xs text-gray-500">
          Renseigne un budget sur le projet pour suivre la marge et le taux horaire réel.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Budget</p>
              <p className="text-lg font-bold text-white tabular-nums">{formatCurrency(budget)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Coût du temps</p>
              <p className="text-lg font-bold text-amber-400 tabular-nums">{formatCurrency(cost)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Marge</p>
              <p className={`text-lg font-bold tabular-nums ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(margin)}
              </p>
              {marginRate !== null && (
                <p className={`text-[11px] ${margin >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>{marginRate} %</p>
              )}
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Encaissé</p>
              <p className="text-lg font-bold text-emerald-400 tabular-nums">{formatCurrency(collected)}</p>
              {budget > 0 && (
                <p className="text-[11px] text-gray-500">{Math.round((collected / budget) * 100)} % du budget</p>
              )}
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-gray-400">Budget consommé par le temps passé</span>
              <span className={over ? 'text-red-400 font-medium' : 'text-gray-400'}>{budgetUsed} %</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : budgetUsed > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${budgetUsed}%` }}
              />
            </div>
          </div>

          {effectiveRate !== null && (
            <p className="text-xs text-gray-500">
              Taux horaire réellement dégagé&nbsp;:{' '}
              <span className={effectiveRate >= rate ? 'text-green-400' : 'text-amber-400'}>
                {effectiveRate.toFixed(0)} €/h
              </span>{' '}
              pour un objectif de {rate} €/h.
            </p>
          )}
        </>
      )}
    </div>
  )
}
