import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BUSINESS, formatCurrency } from '../lib/business'

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-portal`

interface DocumentPayload {
  number: string
  title: string
  description: string | null
  status: string
  total: number
  paidAmount: number | null
  issueDate: string
  dueDate: string | null
  terms: string | null
  notes: string | null
  clientName: string | null
  items: { description: string; quantity: number; unitPrice: number; total: number }[]
}

interface ProjectPayload {
  name: string
  status: string
  description: string | null
  startDate: string | null
  endDate: string | null
  progress: number
  tasksDone: number
  tasksTotal: number
  milestones: { title: string; due_date: string; status: string }[]
}

interface PortalPayload {
  entityType: 'quote' | 'invoice' | 'project'
  allowAccept: boolean
  respondedAt: string | null
  response: 'accepted' | 'rejected' | null
  document?: DocumentPayload
  project?: ProjectPayload
  error?: string
}

const MILESTONE_LABEL: Record<string, string> = {
  planned: 'Prévu', at_risk: 'À confirmer', reached: 'Livré', missed: 'Décalé',
}
const PROJECT_STATUS_LABEL: Record<string, string> = {
  briefing: 'Cadrage', design: 'Design', development: 'Développement',
  review: 'Recette', delivered: 'Livré', active: 'En cours', archived: 'Clos',
}

export default function ClientPortal() {
  const { token } = useParams()
  const [data, setData] = useState<PortalPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${FUNCTION_URL}?token=${encodeURIComponent(token || '')}`)
      const payload = await res.json()
      if (!res.ok) { setError(payload.error || 'Ce lien ne peut pas être ouvert.'); setLoading(false); return }
      setData(payload)
    } catch {
      setError('Impossible de charger ce document. Vérifiez votre connexion.')
    }
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  const respond = async (response: 'accepted' | 'rejected') => {
    if (!name.trim()) { setError('Indiquez votre nom pour valider.'); return }
    setSending(true)
    setError(null)
    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, response, name: name.trim() }),
      })
      const payload = await res.json()
      if (!res.ok || payload.ok === false) {
        setError(payload.error || "Votre réponse n'a pas pu être enregistrée.")
      } else {
        await load()
      }
    } catch {
      setError("Votre réponse n'a pas pu être envoyée. Réessayez.")
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Lien indisponible</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Contactez {BUSINESS.tradeName} à {BUSINESS.email} pour recevoir un nouveau lien.
          </p>
        </div>
      </div>
    )
  }

  const doc = data?.document
  const project = data?.project
  const isQuote = data?.entityType === 'quote'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-semibold">{BUSINESS.tradeName}</p>
            <p className="text-sm text-gray-500">{BUSINESS.email}</p>
          </div>
          {doc && <p className="text-sm font-mono text-gray-500">{doc.number}</p>}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {doc && (
          <>
            <h1 className="text-2xl font-semibold mb-1">{doc.title}</h1>
            {doc.clientName && <p className="text-gray-600 mb-6">Pour {doc.clientName}</p>}
            {doc.description && <p className="text-gray-700 mb-6 whitespace-pre-wrap">{doc.description}</p>}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Prestation</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Qté</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Prix unitaire</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(Number(item.unitPrice))}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{formatCurrency(Number(item.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-4 bg-gray-50 border-t border-gray-200">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold tabular-nums">{formatCurrency(Number(doc.total))}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-2">{BUSINESS.tvaMessage}</p>
            {doc.dueDate && (
              <p className="text-sm text-gray-600 mb-6">
                {isQuote ? 'Valable jusqu’au ' : 'À régler avant le '}
                {format(parseISO(doc.dueDate), 'd MMMM yyyy', { locale: fr })}
              </p>
            )}
            {doc.terms && <p className="text-xs text-gray-500 mb-8 whitespace-pre-wrap">{doc.terms}</p>}
          </>
        )}

        {project && (
          <>
            <h1 className="text-2xl font-semibold mb-1">{project.name}</h1>
            <p className="text-gray-600 mb-6">
              {PROJECT_STATUS_LABEL[project.status] || project.status}
            </p>
            {project.description && <p className="text-gray-700 mb-6 whitespace-pre-wrap">{project.description}</p>}

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avancement</span>
                <span className="text-sm text-gray-600 tabular-nums">
                  {project.tasksDone}/{project.tasksTotal} · {project.progress} %
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            {project.milestones.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h2 className="text-sm font-medium mb-4">Étapes</h2>
                <div className="space-y-3">
                  {project.milestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm">{m.title}</p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(m.due_date), 'd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.status === 'reached' ? 'bg-green-100 text-green-700'
                          : m.status === 'missed' ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {MILESTONE_LABEL[m.status] || m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Réponse du client */}
        {data?.respondedAt ? (
          <div className={`rounded-xl p-5 ${data.response === 'accepted' ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
            <p className="text-sm font-medium">
              {data.response === 'accepted' ? 'Document accepté' : 'Document refusé'}
              {' — '}
              {format(parseISO(data.respondedAt), 'd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Merci, {BUSINESS.tradeName} a été prévenu et revient vers vous.
            </p>
          </div>
        ) : data?.allowAccept ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-medium mb-1">Votre réponse</h2>
            <p className="text-sm text-gray-600 mb-4">
              Votre nom vaut signature électronique et horodate votre accord.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom et prénom"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-gray-900"
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => respond('accepted')}
                disabled={sending}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {sending ? 'Envoi…' : 'Accepter'}
              </button>
              <button
                onClick={() => respond('rejected')}
                disabled={sending}
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Refuser
              </button>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-gray-500">
        {BUSINESS.tradeName} · SIRET {BUSINESS.siret} · {BUSINESS.website}
      </footer>
    </div>
  )
}
