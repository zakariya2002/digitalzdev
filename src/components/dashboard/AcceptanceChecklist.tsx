import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import Avatar from './Avatar'
import type { AcceptanceCheck, CheckCategory, CheckStatus } from '../../types/database'

const CATEGORIES: { value: CheckCategory; label: string }[] = [
  { value: 'fonctionnel', label: 'Fonctionnel' },
  { value: 'design', label: 'Design' },
  { value: 'contenu', label: 'Contenu' },
  { value: 'technique', label: 'Technique' },
  { value: 'seo', label: 'SEO' },
  { value: 'legal', label: 'Légal' },
]

/** Points de contrôle standards d'une livraison web, proposés en un clic. */
const DEFAULT_CHECKS: { title: string; category: CheckCategory }[] = [
  { title: 'Toutes les pages sont accessibles et sans erreur', category: 'fonctionnel' },
  { title: 'Les formulaires envoient bien leurs données', category: 'fonctionnel' },
  { title: 'Affichage correct sur mobile et tablette', category: 'design' },
  { title: 'Textes et images définitifs en place', category: 'contenu' },
  { title: 'Titres, descriptions et favicon renseignés', category: 'seo' },
  { title: 'Redirections et nom de domaine configurés', category: 'technique' },
  { title: 'Certificat HTTPS actif', category: 'technique' },
  { title: 'Mentions légales et politique de confidentialité publiées', category: 'legal' },
]

const STATUS_META: Record<CheckStatus, { label: string; className: string }> = {
  todo: { label: 'À vérifier', className: 'bg-gray-700 text-gray-300' },
  ok: { label: 'Validé', className: 'bg-green-500/20 text-green-400' },
  ko: { label: 'À corriger', className: 'bg-red-500/20 text-red-400' },
}

interface AcceptanceChecklistProps {
  projectId: string
}

export default function AcceptanceChecklist({ projectId }: AcceptanceChecklistProps) {
  const { profile, memberById } = useTeam()
  const [checks, setChecks] = useState<AcceptanceCheck[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CheckCategory>('fonctionnel')
  const [error, setError] = useState<string | null>(null)

  const fetchChecks = useCallback(async () => {
    const { data, error: e } = await supabase
      .from('acceptance_checks').select('*').eq('project_id', projectId).order('position')
    if (e) { setError('Impossible de charger la recette.'); return }
    setChecks((data || []) as AcceptanceCheck[])
  }, [projectId])

  useEffect(() => { fetchChecks() }, [fetchChecks])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const { error: err } = await supabase.from('acceptance_checks').insert({
      project_id: projectId, title: title.trim(), category, position: checks.length,
    })
    if (err) { setError("Le point n'a pas pu être ajouté."); return }
    setTitle(''); setError(null)
    fetchChecks()
  }

  const loadDefaults = async () => {
    const rows = DEFAULT_CHECKS.map((c, i) => ({
      project_id: projectId, title: c.title, category: c.category, position: checks.length + i,
    }))
    const { error: err } = await supabase.from('acceptance_checks').insert(rows)
    if (err) { setError("La checklist type n'a pas pu être chargée."); return }
    fetchChecks()
  }

  const setStatus = async (check: AcceptanceCheck, status: CheckStatus) => {
    setChecks(prev => prev.map(c => c.id === check.id ? { ...c, status } : c))
    const { error: err } = await supabase.from('acceptance_checks').update({
      status,
      checked_by: status === 'todo' ? null : profile?.id ?? null,
      checked_at: status === 'todo' ? null : new Date().toISOString(),
    }).eq('id', check.id)
    if (err) { setError('La mise à jour a échoué.'); fetchChecks() }
  }

  const remove = async (id: string) => {
    setChecks(prev => prev.filter(c => c.id !== id))
    await supabase.from('acceptance_checks').delete().eq('id', id)
  }

  const ok = checks.filter(c => c.status === 'ok').length
  const ko = checks.filter(c => c.status === 'ko').length
  const ready = checks.length > 0 && ok === checks.length

  const inputClass = 'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-white">Recette</h3>
        <div className="flex items-center gap-3 text-xs">
          {ko > 0 && <span className="text-red-400">{ko} à corriger</span>}
          <span className="text-gray-500 tabular-nums">{ok}/{checks.length} validés</span>
          {ready && (
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-medium">Prêt à livrer</span>
          )}
        </div>
      </div>

      {checks.length === 0 ? (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-3">
            Aucun point de recette. Charge la checklist type d'une livraison web, puis adapte-la au projet.
          </p>
          <button
            onClick={loadDefaults}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Charger la checklist type ({DEFAULT_CHECKS.length} points)
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 mb-4">
          {checks.map(check => {
            const checker = memberById(check.checked_by)
            return (
              <div key={check.id} className="flex items-center gap-3 p-2.5 bg-gray-800/60 rounded-lg group">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${check.status === 'ok' ? 'text-gray-400' : 'text-gray-200'}`}>
                    {check.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                      {CATEGORIES.find(c => c.value === check.category)?.label}
                    </span>
                    {checker && <Avatar profile={checker} size="xs" />}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {(['ok', 'ko', 'todo'] as CheckStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(check, s)}
                      className={`text-[11px] px-2 py-1 rounded transition-colors ${
                        check.status === s ? STATUS_META[s].className : 'text-gray-500 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                  <button
                    onClick={() => remove(check.id)}
                    className="text-[11px] px-1.5 py-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Point à vérifier avant livraison" className={`${inputClass} flex-1`}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value as CheckCategory)} className={inputClass}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button
          type="submit" disabled={!title.trim()}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors"
        >
          Ajouter
        </button>
      </form>
    </div>
  )
}
