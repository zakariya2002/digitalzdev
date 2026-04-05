import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import ClientModal from '../../components/dashboard/ClientModal'
import type { Client, ClientStatus, ClientSource, Project } from '../../types/database'

const STATUS_BADGE: Record<ClientStatus, { label: string; bg: string; text: string }> = {
  new_lead: { label: 'Nouveau lead', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  contacted: { label: 'Contacté', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  qualified: { label: 'Qualifié', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  active: { label: 'Client actif', bg: 'bg-green-500/20', text: 'text-green-400' },
  completed: { label: 'Terminé', bg: 'bg-gray-500/20', text: 'text-gray-400' },
}

const SOURCE_LABEL: Record<ClientSource, string> = {
  facebook: 'Facebook Ads',
  website: 'Site web',
  referral: 'Recommandation',
  manual: 'Manuel',
  other: 'Autre',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filterStatus, setFilterStatus] = useState<ClientStatus | ''>('')
  const [filterSource, setFilterSource] = useState<ClientSource | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const fetchAll = useCallback(async () => {
    const [{ data: c, error: ce }, { data: p }] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').eq('is_archived', false).order('name'),
    ])
    if (ce) console.error('Fetch clients error:', ce)
    if (c) setClients(c as Client[])
    if (p) setProjects(p as Project[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = clients
    .filter(c => !filterStatus || c.status === filterStatus)
    .filter(c => !filterSource || c.source === filterSource)

  const handleSave = async (data: {
    name: string
    email: string | null
    phone: string | null
    source: ClientSource
    status: ClientStatus
    notes: string | null
    project_id: string | null
  }) => {
    if (editingClient) {
      const { error } = await supabase.from('clients').update(data).eq('id', editingClient.id)
      if (error) console.error('Update client error:', error)
    } else {
      const { error } = await supabase.from('clients').insert(data)
      if (error) console.error('Insert client error:', error)
    }
    setEditingClient(null)
    fetchAll()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) console.error('Delete client error:', error)
    setEditingClient(null)
    fetchAll()
  }

  // Stats
  const newLeads = clients.filter(c => c.status === 'new_lead').length
  const activeClients = clients.filter(c => c.status === 'active').length
  const fromFacebook = clients.filter(c => c.source === 'facebook').length
  const conversionRate = clients.length > 0
    ? Math.round((clients.filter(c => c.status === 'active' || c.status === 'completed').length / clients.length) * 100)
    : 0

  return (
    <div className="p-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nouveaux leads</p>
          <p className="text-2xl font-bold text-blue-400">{newLeads}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Clients actifs</p>
          <p className="text-2xl font-bold text-green-400">{activeClients}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Via Facebook</p>
          <p className="text-2xl font-bold text-indigo-400">{fromFacebook}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Taux de conversion</p>
          <p className="text-2xl font-bold text-white">{conversionRate}%</p>
        </div>
      </div>

      {/* Pipeline visuel */}
      <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-3">
        {(Object.entries(STATUS_BADGE) as [ClientStatus, typeof STATUS_BADGE[ClientStatus]][]).map(([key, val]) => {
          const count = clients.filter(c => c.status === key).length
          return (
            <div key={key} className="flex-1 text-center">
              <div className={`text-xs font-medium ${val.text} mb-1`}>{val.label}</div>
              <div className={`text-lg font-bold text-white`}>{count}</div>
              <div className={`h-1 rounded-full mt-1 ${val.bg}`}>
                <div
                  className={`h-full rounded-full transition-all ${val.bg.replace('/20', '')}`}
                  style={{ width: clients.length > 0 ? `${(count / clients.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters + button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ClientStatus | '')}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="new_lead">Nouveau lead</option>
            <option value="contacted">Contacté</option>
            <option value="qualified">Qualifié</option>
            <option value="active">Client actif</option>
            <option value="completed">Terminé</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as ClientSource | '')}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Toutes sources</option>
            <option value="facebook">Facebook Ads</option>
            <option value="website">Site web</option>
            <option value="referral">Recommandation</option>
            <option value="manual">Manuel</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <button
          onClick={() => { setEditingClient(null); setModalOpen(true) }}
          className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nouveau lead / client
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucun lead / client
                </td>
              </tr>
            ) : (
              filtered.map((client) => {
                const project = projects.find(p => p.id === client.project_id)
                const badge = STATUS_BADGE[client.status]
                return (
                  <tr key={client.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{client.name}</p>
                      {client.notes && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{client.notes}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-400">{client.email || '—'}</p>
                      {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {SOURCE_LABEL[client.source] || client.source}
                    </td>
                    <td className="px-4 py-3">
                      {project ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                          <span className="text-sm text-gray-300">{project.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setEditingClient(client); setModalOpen(true) }}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <ClientModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClient(null) }}
        client={editingClient}
        projects={projects}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
