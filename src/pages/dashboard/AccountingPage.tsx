import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import { useTaxRegimes } from '../../hooks/useTaxRegimes'
import TaxSimulator from '../../components/dashboard/TaxSimulator'
import ErrorBanner from '../../components/dashboard/ErrorBanner'
import type { TaxRegime } from '../../lib/tax'

/** Libellés des paramètres : le formulaire reste lisible sans connaître le JSON */
const PARAM_LABELS: Record<string, { label: string; unit: 'rate' | 'amount' | 'ratio'; help?: string }> = {
  social_rate: { label: 'Cotisations sociales', unit: 'rate', help: 'Appliqué au chiffre d\'affaires' },
  training_rate: { label: 'Formation professionnelle', unit: 'rate' },
  liberatory_tax_rate: { label: 'Versement libératoire', unit: 'rate', help: 'Impôt sur le revenu payé au fil de l\'eau' },
  income_allowance: { label: 'Abattement pour l\'impôt', unit: 'rate' },
  revenue_ceiling: { label: 'Plafond de chiffre d\'affaires', unit: 'amount' },
  min_social_base: { label: 'Base minimale de cotisation', unit: 'amount' },
  vat_franchise_ceiling: { label: 'Seuil de franchise de TVA', unit: 'amount' },
  vat_rate: { label: 'Taux de TVA', unit: 'rate' },
  employer_rate: { label: 'Cotisations patronales', unit: 'rate', help: 'En pourcentage du brut' },
  employee_rate: { label: 'Cotisations salariales', unit: 'rate' },
  corporate_tax_reduced: { label: 'Impôt sur les sociétés (taux réduit)', unit: 'rate' },
  corporate_tax_threshold: { label: 'Seuil du taux réduit', unit: 'amount' },
  corporate_tax_standard: { label: 'Impôt sur les sociétés (taux normal)', unit: 'rate' },
  dividend_flat_tax: { label: 'Imposition des dividendes', unit: 'rate' },
  default_salary_share: { label: 'Part par défaut en rémunération', unit: 'rate' },
  accounting_cost: { label: 'Comptabilité et frais annuels', unit: 'amount' },
}

export default function AccountingPage() {
  const { isOwner } = useTeam()
  const { regimes, settings, activeRegime, loading, error, refresh } = useTaxRegimes()
  const [editing, setEditing] = useState<TaxRegime | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [rate, setRate] = useState('')
  const [bank, setBank] = useState({ account_holder: '', bank_name: '', iban: '', bic: '', payment_reference_note: '' })
  const [bankSaved, setBankSaved] = useState(false)

  useEffect(() => {
    if (settings?.eur_to_dzd) setRate(String(settings.eur_to_dzd))
    if (settings) {
      setBank({
        account_holder: settings.account_holder || '',
        bank_name: settings.bank_name || '',
        iban: settings.iban || '',
        bic: settings.bic || '',
        payment_reference_note: settings.payment_reference_note || '',
      })
    }
  }, [settings])

  const saveBank = async () => {
    const { error: e } = await supabase.from('company_settings').update({
      account_holder: bank.account_holder.trim() || null,
      bank_name: bank.bank_name.trim() || null,
      // L'IBAN se saisit avec ou sans espaces : on le range par groupes de quatre
      iban: bank.iban.replace(/\s+/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim() || null,
      bic: bank.bic.replace(/\s+/g, '').toUpperCase() || null,
      payment_reference_note: bank.payment_reference_note.trim() || null,
    }).eq('id', true)
    if (e) { setSaveError("Les coordonnées bancaires n'ont pas pu être enregistrées."); return }
    setBankSaved(true)
    setTimeout(() => setBankSaved(false), 2500)
    refresh()
  }

  const openEditor = (regime: TaxRegime) => {
    setEditing(regime)
    setSaved(false)
    const params = regime.params as unknown as Record<string, number | null>
    setDraft(Object.fromEntries(
      Object.entries(params)
        .filter(([k]) => k !== 'kind')
        .map(([k, v]) => [k, v === null ? '' : String(v)])
    ))
  }

  const saveRegime = async () => {
    if (!editing) return
    const params: Record<string, unknown> = { kind: (editing.params as { kind: string }).kind }
    for (const [k, v] of Object.entries(draft)) {
      params[k] = v === '' ? null : Number(v)
    }
    const { error: e } = await supabase.from('tax_regimes')
      .update({ params: params as never }).eq('id', editing.id)
    if (e) { setSaveError("Le barème n'a pas pu être enregistré."); return }
    setSaveError(null)
    setSaved(true)
    setEditing(null)
    refresh()
  }

  const setActive = async (id: string) => {
    const { error: e } = await supabase.from('company_settings').update({ active_regime_id: id }).eq('id', true)
    if (e) { setSaveError("Le statut n'a pas pu être changé."); return }
    refresh()
  }

  const saveRate = async () => {
    const { error: e } = await supabase.from('company_settings')
      .update({ eur_to_dzd: parseFloat(rate) || 145 }).eq('id', true)
    if (e) { setSaveError("Le cours n'a pas pu être enregistré."); return }
    setSaved(true)
    refresh()
  }

  const inputClass = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500'

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <ErrorBanner message={error || saveError} onDismiss={() => setSaveError(null)} />

      <TaxSimulator title="Comparer les statuts sur un montant" />

      {/* Statuts disponibles */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-white">Statuts et barèmes</h3>
            <p className="text-xs text-gray-500">
              Les taux évoluent chaque année. Ils se modifient ici, sans toucher au code.
            </p>
          </div>
          {saved && <span className="text-xs text-green-400">Enregistré</span>}
        </div>

        <div className="space-y-2">
          {regimes.map(regime => {
            const isActive = regime.id === activeRegime?.id
            return (
              <div key={regime.id} className={`p-4 rounded-lg border ${isActive ? 'border-blue-600/60 bg-blue-600/5' : 'border-gray-800 bg-gray-800/40'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white">{regime.label}</p>
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-700 text-gray-300">
                        {regime.country === 'FR' ? 'France' : 'Algérie'} · {regime.currency}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-800 text-gray-500">
                        barème {regime.fiscal_year}
                      </span>
                      {isActive && <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-400">Mon statut</span>}
                    </div>
                    {regime.notes && <p className="text-xs text-gray-500 mt-1.5">{regime.notes}</p>}
                    {regime.source_note && <p className="text-[11px] text-amber-400/80 mt-1">{regime.source_note}</p>}
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isActive && (
                        <button onClick={() => setActive(regime.id)}
                                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                          C'est mon statut
                        </button>
                      )}
                      <button onClick={() => openEditor(regime)}
                              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Modifier les taux
                      </button>
                    </div>
                  )}
                </div>

                {editing?.id === regime.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {Object.entries(draft).map(([key, value]) => {
                        const meta = PARAM_LABELS[key]
                        return (
                          <div key={key}>
                            <label className="block text-xs text-gray-400 mb-1">
                              {meta?.label || key}
                              {meta?.unit === 'rate' && <span className="text-gray-600"> (0,212 = 21,2 %)</span>}
                            </label>
                            <input
                              type="number" step="any" value={value}
                              onChange={(e) => setDraft(d => ({ ...d, [key]: e.target.value }))}
                              className={inputClass}
                            />
                            {meta?.help && <p className="text-[10px] text-gray-600 mt-0.5">{meta.help}</p>}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={saveRegime}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Enregistrer le barème
                      </button>
                      <button onClick={() => setEditing(null)}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Coordonnées bancaires */}
      {isOwner && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
            <h3 className="text-sm font-semibold text-white">Coordonnées bancaires</h3>
            {bankSaved && <span className="text-xs text-green-400">Enregistré</span>}
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Elles figurent sur les factures imprimées, pour que le client puisse régler
            sans te les demander. Elles n'apparaissent pas sur les devis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Titulaire du compte</label>
              <input type="text" value={bank.account_holder}
                     onChange={(e) => setBank(b => ({ ...b, account_holder: e.target.value }))}
                     placeholder="Zakariya Nebbache" className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Banque</label>
              <input type="text" value={bank.bank_name}
                     onChange={(e) => setBank(b => ({ ...b, bank_name: e.target.value }))}
                     placeholder="Qonto, BNP, Revolut…" className={`${inputClass} w-full`} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">IBAN</label>
              <input type="text" value={bank.iban}
                     onChange={(e) => setBank(b => ({ ...b, iban: e.target.value }))}
                     placeholder="FR76 3000 4000 0100 0000 0000 123"
                     className={`${inputClass} w-full font-mono`} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">BIC</label>
              <input type="text" value={bank.bic}
                     onChange={(e) => setBank(b => ({ ...b, bic: e.target.value }))}
                     placeholder="BNPAFRPP" className={`${inputClass} w-full font-mono`} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mention sous le RIB</label>
              <input type="text" value={bank.payment_reference_note}
                     onChange={(e) => setBank(b => ({ ...b, payment_reference_note: e.target.value }))}
                     placeholder="Merci d'indiquer le numéro de facture en référence."
                     className={`${inputClass} w-full`} />
            </div>
          </div>
          <button onClick={saveBank}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Enregistrer
          </button>
        </div>
      )}

      {/* Cours de conversion */}
      {isOwner && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Cours de conversion</h3>
          <p className="text-xs text-gray-500 mb-3">
            Sert à comparer un devis en euros avec le statut algérien.
          </p>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Dinars pour 1 euro</label>
              <input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)}
                     className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 w-32" />
            </div>
            <button onClick={saveRate}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
