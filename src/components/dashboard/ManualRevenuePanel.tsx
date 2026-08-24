import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/business'
import type { Revenue, Project } from '../../types/database'

/** Encaissements sans facture : acompte en espèces, apport, régularisation.
 *  Ils entrent dans le grand livre au même titre que les paiements de factures. */
export default function ManualRevenuePanel() {
  const [entries, setEntries] = useState<Revenue[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    const [{ data: r, error: e }, { data: p }] = await Promise.all([
      supabase.from('revenues').select('*').order('month', { ascending: false }),
      supabase.from('projects').select('*').order('name'),
    ])
    if (e) { setError('Impossible de charger les encaissements.'); return }
    setEntries((r || []) as unknown as Revenue[])
    setProjects((p || []) as unknown as Project[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const add = async (e: FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!value || !month) return
    const { error: err } = await supabase.from('revenues').insert({
      amount: value,
      description: description.trim() || null,
      month: `${month}-01`,
      project_id: projectId || null,
    })
    if (err) { setError("L'encaissement n'a pas pu être enregistré."); return }
    setAmount(''); setDescription(''); setProjectId(''); setError(null)
    fetchAll()
  }

  const remove = async (id: string) => {
    setEntries(prev => prev.filter(x => x.id !== id))
    await supabase.from('revenues').delete().eq('id', id)
  }

  const inputClass = 'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-1">Encaissements hors facture</h3>
      <p className="text-xs text-gray-500 mb-4">
        Pour ce qui n'a pas donné lieu à une facture dans le CRM. Ces montants sont comptés
        dans le chiffre d'affaires ci-dessus.
      </p>

      {entries.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center gap-3 px-3 py-2 bg-gray-800/60 rounded-lg group">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{entry.description || 'Encaissement'}</p>
                <p className="text-[11px] text-gray-500">
                  {format(parseISO(entry.month), 'MMMM yyyy', { locale: fr })}
                  {entry.project_id && ` · ${projects.find(p => p.id === entry.project_id)?.name || 'projet supprimé'}`}
                </p>
              </div>
              <span className="text-sm font-medium text-green-400 tabular-nums flex-shrink-0">
                {formatCurrency(Number(entry.amount))}
              </span>
              <button
                onClick={() => remove(entry.id)}
                className="text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <form onSubmit={add} className="flex flex-col sm:flex-row gap-2">
        <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)}
               placeholder="Montant" className={`${inputClass} sm:w-32`} />
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass} />
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
               placeholder="Nature de l'encaissement" className={`${inputClass} flex-1`} />
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
          <option value="">Sans projet</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button type="submit" disabled={!amount}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors">
          Ajouter
        </button>
      </form>
    </div>
  )
}
