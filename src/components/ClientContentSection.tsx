import { useState, useRef } from 'react'

export interface ClientContentItem {
  id: string
  label: string
  description: string | null
  kind: 'file' | 'text' | 'both'
  category: string
  is_required: boolean
  status: 'pending' | 'received' | 'validated' | 'rejected'
  response_text: string | null
  review_note: string | null
  files: { id: string; name: string; size: number | null; at: string }[]
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: 'À fournir', className: 'bg-gray-100 text-gray-600' },
  received: { label: 'Reçu', className: 'bg-amber-100 text-amber-700' },
  validated: { label: 'Validé', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'À revoir', className: 'bg-red-100 text-red-700' },
}

interface Props {
  items: ClientContentItem[]
  functionUrl: string
  token: string
  onChanged: () => void
}

/** Côté client : il dépose ses documents et écrit ses informations, sans compte. */
export default function ClientContentSection({ items, functionUrl, token, onChanged }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})

  if (items.length === 0) return null

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...payload }),
    })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Une erreur est survenue.')
    return data
  }

  const sendText = async (item: ClientContentItem) => {
    setBusy(item.id); setError(null)
    try {
      await post({ action: 'content_text', requestId: item.id, text: drafts[item.id] ?? item.response_text ?? '' })
      onChanged()
    } catch (e) {
      setError((e as Error).message)
    }
    setBusy(null)
  }

  const sendFile = async (item: ClientContentItem, file: File) => {
    setBusy(item.id); setError(null)
    try {
      const prep = await post({
        action: 'content_upload', requestId: item.id,
        fileName: file.name, size: file.size, contentType: file.type,
      })
      const upload = await fetch(prep.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })
      if (!upload.ok) throw new Error("Le document n'a pas pu être envoyé.")
      await post({
        action: 'content_uploaded', requestId: item.id, path: prep.path,
        fileName: file.name, size: file.size, contentType: file.type, clientName: name || null,
      })
      onChanged()
    } catch (e) {
      setError((e as Error).message)
    }
    setBusy(null)
    if (inputs.current[item.id]) inputs.current[item.id]!.value = ''
  }

  const remaining = items.filter(i => i.is_required && i.status === 'pending').length

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
        <h2 className="text-lg font-semibold">Ce que nous attendons de vous</h2>
        <span className="text-sm text-gray-500">
          {remaining === 0 ? 'Tout est arrivé, merci' : `${remaining} élément${remaining > 1 ? 's' : ''} à fournir`}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-5">
        Déposez vos documents et complétez les informations demandées. Vous pouvez revenir
        sur cette page autant de fois que nécessaire.
      </p>

      <div className="mb-5">
        <label className="block text-sm text-gray-600 mb-1">Votre nom (pour qu'on sache qui a envoyé)</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nom et prénom"
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
        />
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => {
          const meta = STATUS_META[item.status]
          const wantsFile = item.kind === 'file' || item.kind === 'both'
          const wantsText = item.kind === 'text' || item.kind === 'both'
          const value = drafts[item.id] ?? item.response_text ?? ''
          return (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                <p className="font-medium">
                  {item.label}
                  {item.is_required && <span className="text-red-600 ml-1" title="Obligatoire">*</span>}
                </p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${meta.className}`}>{meta.label}</span>
              </div>
              {item.description && <p className="text-sm text-gray-600 mb-3">{item.description}</p>}
              {item.review_note && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  {item.review_note}
                </p>
              )}

              {item.files.length > 0 && (
                <ul className="text-sm text-gray-600 mb-3 space-y-1">
                  {item.files.map(f => (
                    <li key={f.id}>✓ {f.name} <span className="text-gray-400">reçu</span></li>
                  ))}
                </ul>
              )}

              {wantsText && (
                <div className="mb-3">
                  <textarea
                    value={value}
                    onChange={(e) => setDrafts(d => ({ ...d, [item.id]: e.target.value }))}
                    rows={3}
                    placeholder="Votre réponse…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 resize-none"
                  />
                  <button
                    onClick={() => sendText(item)}
                    disabled={busy === item.id || !value.trim()}
                    className="mt-2 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
                  >
                    {busy === item.id ? 'Envoi…' : 'Enregistrer'}
                  </button>
                </div>
              )}

              {wantsFile && (
                <div>
                  <input
                    ref={(el) => { inputs.current[item.id] = el }}
                    type="file"
                    disabled={busy === item.id}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) sendFile(item, f) }}
                    className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-1">25 Mo par document</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
