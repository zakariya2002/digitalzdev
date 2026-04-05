import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTwilio } from '../../contexts/TwilioContext'
import { formatPhone, toE164 } from '../../lib/phone'
import ClientModal from '../../components/dashboard/ClientModal'
import SmsComposer from '../../components/dashboard/SmsComposer'
import LeadTimeline from '../../components/dashboard/LeadTimeline'
import CallHistory from '../../components/dashboard/CallHistory'
import SmsThread from '../../components/dashboard/SmsThread'
import type { Client, ClientStatus, ClientSource, Project } from '../../types/database'

const STATUS_BADGE: Record<ClientStatus, { label: string; bg: string; text: string }> = {
  new_lead: { label: 'Nouveau lead', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  contacted: { label: 'Contacté', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  qualified: { label: 'Qualifié', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  active: { label: 'Client actif', bg: 'bg-green-500/20', text: 'text-green-400' },
  completed: { label: 'Terminé', bg: 'bg-gray-500/20', text: 'text-gray-400' },
}

type Tab = 'infos' | 'timeline' | 'calls' | 'sms'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { makeCall } = useTwilio()

  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('infos')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [smsModalOpen, setSmsModalOpen] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')

  const fetchClient = useCallback(async () => {
    if (!id) return
    const [{ data: c, error }, { data: p }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('projects').select('*').eq('is_archived', false).order('name'),
    ])
    if (error) console.error('Fetch client error:', error)
    if (c) {
      setClient(c as Client)
      setFollowUpDate(c.next_follow_up_at ? c.next_follow_up_at.slice(0, 16) : '')
    }
    if (p) setProjects(p as Project[])
    setLoading(false)
  }, [id])

  useEffect(() => { fetchClient() }, [fetchClient])

  const handleSaveClient = async (data: {
    name: string
    email: string | null
    phone: string | null
    source: ClientSource
    status: ClientStatus
    notes: string | null
    project_id: string | null
  }) => {
    if (!client) return
    const { error } = await supabase.from('clients').update(data).eq('id', client.id)
    if (error) console.error('Update client error:', error)
    fetchClient()
  }

  const handleDeleteClient = async (clientId: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId)
    if (error) console.error('Delete client error:', error)
    navigate('/dashboard/clients')
  }

  const handleCall = () => {
    if (client?.phone) {
      makeCall(toE164(client.phone))
    }
  }

  const handleFollowUpChange = async (value: string) => {
    setFollowUpDate(value)
    if (client) {
      await supabase
        .from('clients')
        .update({ next_follow_up_at: value || null })
        .eq('id', client.id)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Client introuvable</p>
        <button onClick={() => navigate('/dashboard/clients')} className="text-blue-400 text-sm mt-2 hover:underline">
          Retour aux leads
        </button>
      </div>
    )
  }

  const badge = STATUS_BADGE[client.status]
  const project = projects.find((p) => p.id === client.project_id)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'infos', label: 'Infos' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'calls', label: `Appels (${client.call_count || 0})` },
    { key: 'sms', label: `SMS (${client.sms_count || 0})` },
  ]

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate('/dashboard/clients')}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour aux leads
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{client.name}</h2>
            <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          {project && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
              <span className="text-sm text-gray-400">{project.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCall}
            disabled={!client.phone}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Appeler
          </button>
          <button
            onClick={() => setSmsModalOpen(true)}
            disabled={!client.phone}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            SMS
          </button>
        </div>
      </div>

      {/* Follow-up */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Prochaine relance</label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => handleFollowUpChange(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          {client.last_contacted_at && (
            <div>
              <p className="text-xs text-gray-500">Dernier contact</p>
              <p className="text-sm text-gray-300">
                {format(new Date(client.last_contacted_at), 'd MMM yyyy HH:mm', { locale: fr })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {tab === 'infos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm text-white">{client.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                <p className="text-sm text-white">{formatPhone(client.phone)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Téléphone secondaire</p>
                <p className="text-sm text-white">{formatPhone(client.phone_secondary)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Source</p>
                <p className="text-sm text-white capitalize">{client.source}</p>
              </div>
            </div>
            {client.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Modifier les infos
              </button>
            </div>
          </div>
        )}

        {tab === 'timeline' && <LeadTimeline clientId={client.id} />}
        {tab === 'calls' && <CallHistory clientId={client.id} clientPhone={client.phone} />}
        {tab === 'sms' && (
          <div className="space-y-4">
            <SmsThread clientId={client.id} />
            <button
              onClick={() => setSmsModalOpen(true)}
              disabled={!client.phone}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Envoyer un SMS
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ClientModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        client={client}
        projects={projects}
        onSave={handleSaveClient}
        onDelete={handleDeleteClient}
      />

      {client && (
        <SmsComposer
          open={smsModalOpen}
          onClose={() => setSmsModalOpen(false)}
          client={client}
          onSent={fetchClient}
        />
      )}
    </div>
  )
}
