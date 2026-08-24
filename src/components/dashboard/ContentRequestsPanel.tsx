import { useState, useEffect, useCallback, useId, type FormEvent } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import type { ContentRequest, ContentKind, ContentCategory, ContentStatus, ProjectFile } from '../../types/database'

const CATEGORIES: { value: ContentCategory; label: string }[] = [
  { value: 'identite', label: 'Identité' },
  { value: 'contenu', label: 'Contenu' },
  { value: 'media', label: 'Photos et médias' },
  { value: 'juridique', label: 'Juridique' },
  { value: 'technique', label: 'Technique' },
  { value: 'autre', label: 'Autre' },
]

const KINDS: { value: ContentKind; label: string }[] = [
  { value: 'file', label: 'Un document' },
  { value: 'text', label: 'Une information écrite' },
  { value: 'both', label: 'Les deux' },
]

const STATUS_META: Record<ContentStatus, { label: string; className: string }> = {
  pending: { label: 'Attendu', className: 'bg-gray-700 text-gray-300' },
  received: { label: 'Reçu', className: 'bg-amber-500/20 text-amber-400' },
  validated: { label: 'Validé', className: 'bg-green-500/20 text-green-400' },
  rejected: { label: 'À refaire', className: 'bg-red-500/20 text-red-400' },
}

interface ContentRequestsPanelProps {
  projectId: string
}

/** Ce qu'on attend du client, ce qu'il a déposé, et ce qui manque encore. */
export default function ContentRequestsPanel({ projectId }: ContentRequestsPanelProps) {
  const { profile } = useTeam()
  const instanceId = useId()
  const [requests, setRequests] = useState<ContentRequest[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)

  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState<ContentKind>('file')
  const [category, setCategory] = useState<ContentCategory>('contenu')

  const fetchAll = useCallback(async () => {
    const [{ data: r, error: e }, { data: f }] = await Promise.all([
      supabase.from('content_requests').select('*').eq('project_id', projectId).order('position'),
      supabase.from('project_files').select('*').eq('project_id', projectId).not('content_request_id', 'is', null),
    ])
    if (e) { setError('Impossible de charger les contenus.'); return }
    setRequests((r || []) as unknown as ContentRequest[])
    setFiles((f || []) as unknown as ProjectFile[])
  }, [projectId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Un dépôt du client apparaît sans recharger
  useEffect(() => {
    const channel = supabase
      .channel(`contents-${projectId}-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_requests', filter: `project_id=eq.${projectId}` },
        () => { fetchAll() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [projectId, fetchAll, instanceId])

  const loadTemplate = async () => {
    setSeeding(true)
    const { data, error: e } = await supabase.rpc('seed_content_requests', { p_project: projectId })
    setSeeding(false)
    if (e) { setError("La trame n'a pas pu être chargée."); return }
    if (data === 0) setError('Tous les éléments de la trame sont déjà dans la liste.')
    fetchAll()
  }

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    const { error: err } = await supabase.from('content_requests').insert({
      project_id: projectId, label: label.trim(), description: description.trim() || null,
      kind, category, position: requests.length,
    })
    if (err) { setError("L'élément n'a pas pu être ajouté."); return }
    setLabel(''); setDescription(''); setError(null)
    fetchAll()
  }

  const setStatus = async (request: ContentRequest, status: ContentStatus, note?: string) => {
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status } : r))
    const { error: e } = await supabase.from('content_requests').update({
      status,
      review_note: note ?? null,
      validated_at: status === 'validated' ? new Date().toISOString() : null,
      validated_by: status === 'validated' ? profile?.id ?? null : null,
    }).eq('id', request.id)
    if (e) { setError('La mise à jour a échoué.'); fetchAll() }
  }

  const remove = async (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id))
    await supabase.from('content_requests').delete().eq('id', id)
  }

  const openFile = async (file: ProjectFile) => {
    if (!file.storage_path) return
    const { data, error: e } = await supabase.storage.from('project-files').createSignedUrl(file.storage_path, 120)
    if (e || !data) { setError("Le document n'a pas pu être ouvert."); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  const missing = requests.filter(r => r.is_required && r.status !== 'validated' && r.status !== 'received').length
  const toReview = requests.filter(r => r.status === 'received').length
  const done = requests.filter(r => r.status === 'validated').length

  const inputClass = 'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-white">Contenus attendus du client</h3>
            <p className="text-xs text-gray-500">
              Le client dépose ses documents et ses informations depuis son espace, sans compte.
              Les fichiers reçus rejoignent les documents du projet.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs flex-shrink-0">
            {toReview > 0 && <span className="text-amber-400">{toReview} à vérifier</span>}
            {missing > 0 && <span className="text-gray-400">{missing} manquant{missing > 1 ? 's' : ''}</span>}
            <span className="text-gray-500 tabular-nums">{done}/{requests.length} validés</span>
          </div>
        </div>

        {requests.length === 0 ? (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Rien de demandé pour l'instant. Charge la trame correspondant au type du projet,
              puis retire ce qui ne s'applique pas.
            </p>
            <button
              onClick={loadTemplate}
              disabled={seeding}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {seeding ? 'Chargement…' : 'Charger la trame type'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map(request => {
              const attached = files.filter(f => f.content_request_id === request.id)
              const meta = STATUS_META[request.status]
              return (
                <div key={request.id} className="p-3 bg-gray-800/60 rounded-lg group">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white">{request.label}</p>
                        <span className={`px-1.5 py-0.5 text-[10px] rounded ${meta.className}`}>{meta.label}</span>
                        {request.is_required && request.status === 'pending' && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-700 text-gray-400">Obligatoire</span>
                        )}
                        <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                          {CATEGORIES.find(c => c.value === request.category)?.label}
                        </span>
                      </div>
                      {request.description && (
                        <p className="text-xs text-gray-500 mt-1">{request.description}</p>
                      )}
                      {request.response_text && (
                        <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                          <p className="text-[10px] text-gray-500 mb-1">Réponse du client</p>
                          <p className="text-xs text-gray-300 whitespace-pre-wrap">{request.response_text}</p>
                        </div>
                      )}
                      {attached.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {attached.map(file => (
                            <button
                              key={file.id}
                              onClick={() => openFile(file)}
                              className="px-2 py-1 text-[11px] bg-gray-900 border border-gray-700 rounded text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {file.name}
                              {file.created_at && (
                                <span className="text-gray-600"> · {format(parseISO(file.created_at), 'd MMM', { locale: fr })}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {request.review_note && (
                        <p className="text-[11px] text-red-400 mt-1.5">Retour envoyé : {request.review_note}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {request.status !== 'validated' && (
                        <button
                          onClick={() => setStatus(request, 'validated')}
                          className="text-[11px] px-2 py-1 rounded bg-green-600/10 text-green-400 hover:bg-green-600/20 transition-colors"
                        >
                          Valider
                        </button>
                      )}
                      {request.status === 'received' && (
                        <button
                          onClick={() => {
                            const note = window.prompt('Que faut-il corriger ? Le client verra ce message.')
                            if (note !== null) setStatus(request, 'rejected', note || undefined)
                          }}
                          className="text-[11px] px-2 py-1 rounded bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors"
                        >
                          Redemander
                        </button>
                      )}
                      <button
                        onClick={() => remove(request.id)}
                        className="text-[11px] px-1.5 py-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            <button
              onClick={loadTemplate}
              disabled={seeding}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              + Compléter avec la trame type
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
      </div>

      <form onSubmit={add} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Demander un élément</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
                 placeholder="Logo, textes, photos…" className={inputClass} />
          <select value={kind} onChange={(e) => setKind(e.target.value as ContentKind)} className={inputClass}>
            {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value as ContentCategory)} className={inputClass}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  placeholder="Précisions pour le client : format attendu, exemples…"
                  className={`${inputClass} w-full resize-none`} />
        <button type="submit" disabled={!label.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
          Ajouter à la liste
        </button>
      </form>
    </div>
  )
}
