import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTaxRegimes } from '../../hooks/useTaxRegimes'
import { simulate, isMicro, formatAmount, convertFromEur, type SimulationInput } from '../../lib/tax'

const MARGINAL_RATES = [
  { value: 0, label: 'Non imposable' },
  { value: 0.11, label: '11 %' },
  { value: 0.30, label: '30 %' },
  { value: 0.41, label: '41 %' },
  { value: 0.45, label: '45 %' },
]

interface TaxSimulatorProps {
  /** Montant de départ, en euros (celui d'un devis par exemple) */
  defaultAmount?: number
  /** Affiche uniquement le régime en vigueur, sans le comparateur */
  compact?: boolean
  title?: string
}

/** Répond à « sur ce montant, qu'est-ce qu'il me reste ? », statut par statut. */
export default function TaxSimulator({ defaultAmount = 1500, compact = false, title = 'Ce qu\'il vous reste' }: TaxSimulatorProps) {
  const { regimes, settings, activeRegime, loading, error } = useTaxRegimes()
  const [amount, setAmount] = useState(String(defaultAmount))
  const [expenses, setExpenses] = useState('')
  const [liberatory, setLiberatory] = useState(true)
  const [marginalRate, setMarginalRate] = useState(0.11)
  const [salaryShare, setSalaryShare] = useState(0.5)
  const [revenueToDate, setRevenueToDate] = useState('')
  const [quotes, setQuotes] = useState<{ id: string; quote_number: string; title: string; total_amount: number }[]>([])
  const [quoteId, setQuoteId] = useState('')
  // Statuts retenus pour la comparaison : par défaut, tous
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null)
  const [annual, setAnnual] = useState(false)

  const eurToDzd = Number(settings?.eur_to_dzd) || 145

  useEffect(() => {
    supabase.from('quotes').select('id, quote_number, title, total_amount')
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setQuotes((data || []) as typeof quotes))
  }, [])

  const pickQuote = (id: string) => {
    setQuoteId(id)
    const quote = quotes.find(q => q.id === id)
    if (quote) setAmount(String(quote.total_amount))
  }

  const visibleRegimes = compact && activeRegime
    ? [activeRegime]
    : regimes.filter(r => !selectedIds || selectedIds.includes(r.id))

  const toggleRegime = (id: string) => {
    setSelectedIds(prev => {
      const current = prev ?? regimes.map(r => r.id)
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
      // On garde toujours au moins un statut affiché
      return next.length === 0 ? current : next
    })
  }

  const results = useMemo(() => {
    const eurAmount = parseFloat(amount) || 0
    const eurExpenses = parseFloat(expenses) || 0
    const eurToDate = parseFloat(revenueToDate) || 0
    const list = visibleRegimes
    return list.map(regime => {
      const input: SimulationInput = {
        revenue: convertFromEur(eurAmount, regime.currency, eurToDzd),
        expenses: convertFromEur(eurExpenses, regime.currency, eurToDzd),
        revenueToDate: convertFromEur(eurToDate, regime.currency, eurToDzd),
        liberatoryTax: liberatory,
        marginalRate,
        salaryShare,
        annual,
      }
      return simulate(regime, input)
    })
  }, [amount, expenses, revenueToDate, liberatory, marginalRate, salaryShare, annual, visibleRegimes, eurToDzd])

  /** Contrepartie en euros d'un montant exprimé dans une autre monnaie. */
  const inEur = (amount: number, currency: string) =>
    currency === 'EUR' || !eurToDzd ? null : formatAmount(amount / eurToDzd, 'EUR')

  const hasCorporate = results.some(r => !isMicro(r.regime.params))
  const inputClass = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  if (loading) return <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-sm text-gray-500">Chargement des barèmes…</div>

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 print:hidden">
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {activeRegime && (
          <span className="text-xs text-gray-500">
            Statut actuel : {activeRegime.label} · barème {activeRegime.fiscal_year}
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      {/* Statuts à comparer */}
      {!compact && regimes.length > 1 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Statuts à comparer</p>
          <div className="flex flex-wrap gap-2">
            {regimes.map(regime => {
              const on = !selectedIds || selectedIds.includes(regime.id)
              return (
                <button
                  key={regime.id}
                  type="button"
                  onClick={() => toggleRegime(regime.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    on ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {regime.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Partir d'un devis déjà enregistré */}
      {!compact && quotes.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Partir d'un devis enregistré</label>
          <select
            value={quoteId}
            onChange={(e) => pickQuote(e.target.value)}
            className="w-full sm:w-96 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Saisir un montant librement</option>
            {quotes.map(q => (
              <option key={q.id} value={q.id}>
                {q.quote_number} · {q.title} · {q.total_amount.toLocaleString('fr-FR')} €
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nature du montant : une facture ou une année entière */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { value: false, label: 'Une facture' },
          { value: true, label: "Mon année entière" },
        ].map(opt => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => setAnnual(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              annual === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Paramètres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div>
          <label className="block text-xs text-gray-400 mb-1">{annual ? "Chiffre d'affaires annuel (€ HT)" : "Montant facturé (€ HT)"}</label>
          <input type="number" min="0" step="50" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Charges réelles (€)</label>
          <input type="number" min="0" step="50" value={expenses} onChange={(e) => setExpenses(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Déjà facturé cette année (€)</label>
          <input type="number" min="0" step="500" value={revenueToDate} onChange={(e) => setRevenueToDate(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Impôt sur le revenu</label>
          <select
            value={liberatory ? 'lib' : String(marginalRate)}
            onChange={(e) => {
              if (e.target.value === 'lib') setLiberatory(true)
              else { setLiberatory(false); setMarginalRate(parseFloat(e.target.value)) }
            }}
            className={inputClass}
          >
            <option value="lib">Versement libératoire</option>
            {MARGINAL_RATES.map(r => (
              <option key={r.value} value={r.value}>Barème : tranche {r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {hasCorporate && (
        <div className="mb-5">
          <label className="block text-xs text-gray-400 mb-1">
            En société : {Math.round(salaryShare * 100)} % versés en rémunération, le reste en dividendes
          </label>
          <input
            type="range" min="0" max="1" step="0.05" value={salaryShare}
            onChange={(e) => setSalaryShare(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      )}

      {/* Résultats */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {results.map(result => {
          const isActive = result.regime.id === activeRegime?.id
          const best = results.reduce((a, b) => (b.netRate > a.netRate ? b : a), results[0])
          const isBest = !compact && results.length > 1 && result.regime.id === best.regime.id
          return (
            <div
              key={result.regime.id}
              className={`rounded-lg p-4 border ${isActive ? 'border-blue-600/60 bg-blue-600/5' : 'border-gray-800 bg-gray-800/40'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{result.regime.label}</p>
                  <p className="text-[11px] text-gray-500">
                    {result.regime.country === 'DZ' ? `Converti à ${eurToDzd} DA pour 1 €` : `Barème ${result.regime.fiscal_year}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {isActive && <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-400">Statut actuel</span>}
                  {isBest && !isActive && <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-500/20 text-green-400">Plus favorable</span>}
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                {result.lines.map((line, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
                    <span className={line.kind === 'net' ? 'text-gray-300' : 'text-gray-500'}>
                      {line.label}
                      {line.hint && <span className="block text-[10px] text-gray-600">{line.hint}</span>}
                    </span>
                    <span className="flex-shrink-0 text-right">
                      <span className={`tabular-nums block ${
                        line.kind === 'net' ? 'text-green-400 font-medium'
                          : line.kind === 'info' ? 'text-gray-500'
                          : 'text-amber-400'
                      }`}>
                        {line.kind === 'charge' || line.kind === 'tax' ? '− ' : ''}
                        {formatAmount(line.amount, result.currency)}
                      </span>
                      {inEur(line.amount, result.currency) && (
                        <span className="block text-[10px] text-gray-600 tabular-nums">
                          soit {inEur(line.amount, result.currency)}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-gray-700">
                <span className="text-sm text-gray-300">Il vous reste</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400 tabular-nums">
                    {formatAmount(result.net, result.currency)}
                  </p>
                  {inEur(result.net, result.currency) && (
                    <p className="text-xs text-green-400/70 tabular-nums">
                      soit {inEur(result.net, result.currency)}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500 tabular-nums">
                    {Math.round(result.netRate * 100)} % du montant facturé
                  </p>
                </div>
              </div>

              {result.warnings.length > 0 && (
                <div className="mt-3 space-y-1">
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-[11px] text-amber-400/90">{w}</p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-600 mt-4">
        Estimation destinée à fixer un tarif. Les barèmes sont saisis dans les réglages et doivent être
        vérifiés chaque année&nbsp;; ce calcul ne remplace pas l'avis d'un comptable.
      </p>
    </div>
  )
}
