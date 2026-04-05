import { useState, useEffect, type FormEvent } from 'react'
import Modal from './Modal'
import type { Client, ClientStatus, ClientSource, Project } from '../../types/database'

interface ClientModalProps {
  open: boolean
  onClose: () => void
  client: Client | null
  projects: Project[]
  onSave: (data: {
    name: string
    email: string | null
    phone: string | null
    source: ClientSource
    status: ClientStatus
    notes: string | null
    project_id: string | null
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const STATUSES: { value: ClientStatus; label: string }[] = [
  { value: 'new_lead', label: 'Nouveau lead' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'qualified', label: 'Qualifié' },
  { value: 'active', label: 'Client actif' },
  { value: 'completed', label: 'Terminé' },
]

const SOURCES: { value: ClientSource; label: string }[] = [
  { value: 'facebook', label: 'Facebook Ads' },
  { value: 'website', label: 'Site web' },
  { value: 'referral', label: 'Recommandation' },
  { value: 'manual', label: 'Ajout manuel' },
  { value: 'other', label: 'Autre' },
]

export default function ClientModal({ open, onClose, client, projects, onSave, onDelete }: ClientModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState<ClientSource>('manual')
  const [status, setStatus] = useState<ClientStatus>('new_lead')
  const [notes, setNotes] = useState('')
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (client) {
      setName(client.name)
      setEmail(client.email || '')
      setPhone(client.phone || '')
      setSource(client.source)
      setStatus(client.status)
      setNotes(client.notes || '')
      setProjectId(client.project_id || '')
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setSource('manual')
      setStatus('new_lead')
      setNotes('')
      setProjectId('')
    }
  }, [client, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSave({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      source,
      status,
      notes: notes.trim() || null,
      project_id: projectId || null,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={client ? 'Modifier' : 'Nouveau lead / client'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Nom complet"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="06 12 34 56 78"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ClientSource)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Projet associé</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Aucun</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Notes..."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Enregistrement...' : client ? 'Modifier' : 'Créer'}
          </button>
          {client && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(client.id); onClose() }}
              className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
