import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { ProjectEnvironment, EnvironmentKind } from '../../types/database'

const KINDS: { value: EnvironmentKind; label: string; badge: string }[] = [
  { value: 'production', label: 'Production', badge: 'bg-green-500/20 text-green-400' },
  { value: 'staging', label: 'Préproduction', badge: 'bg-amber-500/20 text-amber-400' },
  { value: 'repository', label: 'Dépôt de code', badge: 'bg-gray-700 text-gray-300' },
  { value: 'hosting', label: 'Hébergement', badge: 'bg-blue-500/20 text-blue-400' },
  { value: 'registrar', label: 'Registrar', badge: 'bg-purple-500/20 text-purple-400' },
  { value: 'dns', label: 'DNS', badge: 'bg-indigo-500/20 text-indigo-400' },
  { value: 'analytics', label: 'Analytics', badge: 'bg-pink-500/20 text-pink-400' },
  { value: 'other', label: 'Autre', badge: 'bg-gray-700 text-gray-300' },
]

interface EnvironmentsPanelProps {
  projectId: string
}

/** Où vit le projet : URLs, hébergeur, registrar, dépôt. Ce qu'on cherche toujours en urgence. */
export default function EnvironmentsPanel({ projectId }: EnvironmentsPanelProps) {
  const [items, setItems] = useState<ProjectEnvironment[]>([])
  const [kind, setKind] = useState<EnvironmentKind>('production')
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    const { data, error: e } = await supabase
      .from('project_environments').select('*').eq('project_id', projectId).order('kind')
    if (e) { setError('Impossible de charger les accès.'); return }
    setItems((data || []) as ProjectEnvironment[])
  }, [projectId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    const { error: err } = await supabase.from('project_environments').insert({
      project_id: projectId,
      kind,
      label: label.trim(),
      url: url.trim() || null,
      username: username.trim() || null,
      notes: notes.trim() || null,
    })
    if (err) { setError("L'entrée n'a pas pu être ajoutée."); return }
    setLabel(''); setUrl(''); setUsername(''); setNotes(''); setError(null)
    fetchItems()
  }

  const remove = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('project_environments').delete().eq('id', id)
  }

  const inputClass = 'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-white">Accès et environnements</h3>
            <p className="text-xs text-gray-500">
              Adresses, hébergeur, registrar, dépôt. Les identifiants se notent ici, jamais les mots de passe.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-gray-500">Rien de renseigné pour ce projet.</p>
        ) : (
          <div className="space-y-2">
            {items.map(item => {
              const meta = KINDS.find(k => k.value === item.kind)
              return (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-800/60 rounded-lg group">
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${meta?.badge}`}>
                    {meta?.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{item.label}</p>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                         className="text-xs text-blue-400 hover:text-blue-300 break-all">
                        {item.url}
                      </a>
                    )}
                    {item.username && <p className="text-xs text-gray-500">Identifiant : {item.username}</p>}
                    {item.notes && <p className="text-xs text-gray-500 whitespace-pre-wrap">{item.notes}</p>}
                  </div>
                  <button onClick={() => remove(item.id)}
                          className="text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    Retirer
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
      </div>

      <form onSubmit={add} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Ajouter un accès</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={kind} onChange={(e) => setKind(e.target.value as EnvironmentKind)} className={inputClass}>
            {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
                 placeholder="Site en ligne" className={inputClass} />
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                 placeholder="https://…" className={inputClass} />
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                 placeholder="Identifiant (sans mot de passe)" className={inputClass} />
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder="Où trouver les accès, particularités…" className={`${inputClass} w-full resize-none`} />
        <button type="submit" disabled={!label.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
          Ajouter
        </button>
      </form>
    </div>
  )
}
