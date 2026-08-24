import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import { formatCurrency } from '../../lib/business'
import ProjectModal from '../../components/dashboard/ProjectModal'
import Avatar from '../../components/dashboard/Avatar'
import type { ProjectInsert, Project, Task, Client, ProjectStatus } from '../../types/database'

const STATUS_LABELS: Record<string, string> = {
  briefing: 'Briefing', design: 'Design', development: 'Développement',
  review: 'Recette', delivered: 'Livré', active: 'Actif', archived: 'Archivé',
}
const STATUS_COLORS: Record<string, string> = {
  briefing: 'bg-purple-500/20 text-purple-400', design: 'bg-pink-500/20 text-pink-400',
  development: 'bg-blue-500/20 text-blue-400', review: 'bg-amber-500/20 text-amber-400',
  delivered: 'bg-green-500/20 text-green-400', active: 'bg-emerald-500/20 text-emerald-400',
  archived: 'bg-gray-500/20 text-gray-400',
}
const TYPE_LABELS: Record<string, string> = {
  landing: 'Landing page', vitrine: 'Site vitrine', ecommerce: 'E-commerce',
  custom: 'Sur mesure', mobile: 'Mobile', maintenance: 'Maintenance', audit: 'Audit', other: 'Autre',
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { profile, memberById } = useTeam()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | ''>('')
  const [onlyMine, setOnlyMine] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    const [{ data: p, error: pe }, { data: t }, { data: c }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('id, project_id, status, assignee_id, estimated_hours, actual_hours'),
      supabase.from('clients').select('*').order('name'),
    ])
    if (pe) setError('Impossible de charger les projets.')
    if (p) setProjects(p as Project[])
    if (t) setTasks(t as Task[])
    if (c) setClients(c as Client[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const visible = projects
    .filter(p => showArchived ? true : !p.is_archived)
    .filter(p => !filterStatus || p.status === filterStatus)
    .filter(p => {
      if (!onlyMine || !profile) return true
      if (p.lead_id === profile.id) return true
      return tasks.some(t => t.project_id === p.id && t.assignee_id === profile.id)
    })

  const statsFor = (projectId: string) => {
    const list = tasks.filter(t => t.project_id === projectId)
    const done = list.filter(t => t.status === 'done').length
    const hours = list.reduce((sum, t) => sum + (Number(t.actual_hours) || 0), 0)
    return {
      total: list.length,
      done,
      progress: list.length ? Math.round((done / list.length) * 100) : 0,
      hours,
    }
  }

  const handleSave = async (data: ProjectInsert) => {
    if (editingProject) {
      const { error: e } = await supabase.from('projects').update(data).eq('id', editingProject.id)
      if (e) setError("Le projet n'a pas pu être modifié.")
    } else {
      const { error: e } = await supabase.from('projects').insert(data)
      if (e) setError("Le projet n'a pas pu être créé.")
    }
    setEditingProject(null)
    fetchAll()
  }

  const handleDelete = async (id: string) => {
    const { error: e } = await supabase.from('projects').delete().eq('id', id)
    if (e) setError("Le projet n'a pas pu être supprimé.")
    setEditingProject(null)
    fetchAll()
  }

  const handleArchive = async (id: string, archived: boolean) => {
    const { error: e } = await supabase.from('projects').update({ is_archived: archived }).eq('id', id)
    if (e) setError("Le projet n'a pas pu être archivé.")
    fetchAll()
  }

  const activeCount = projects.filter(p => !p.is_archived).length
  const totalBudget = projects.filter(p => !p.is_archived).reduce((s, p) => s + (Number(p.budget) || 0), 0)
  const openTasks = tasks.filter(t => t.status !== 'done').length
  const myTasks = tasks.filter(t => t.assignee_id === profile?.id && t.status !== 'done').length

  return (
    <div className="p-4 sm:p-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Projets en cours</p>
          <p className="text-2xl font-bold text-white">{activeCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Budget engagé</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tâches ouvertes</p>
          <p className="text-2xl font-bold text-blue-400">{openTasks}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dont pour moi</p>
          <p className="text-2xl font-bold text-amber-400">{myTasks}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | '')}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).filter(([k]) => k !== 'archived').map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            onClick={() => setOnlyMine(!onlyMine)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              onlyMine ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Avatar profile={profile} size="xs" />
            Mes projets
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showArchived ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {showArchived ? 'Masquer les archivés' : 'Voir les archivés'}
          </button>
        </div>
        <button
          onClick={() => { setEditingProject(null); setModalOpen(true) }}
          className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nouveau projet
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-center justify-between gap-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-400 hover:text-red-300">Fermer</button>
        </div>
      )}

      {/* Liste */}
      {visible.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <p className="text-sm text-gray-400 mb-1">Aucun projet à afficher</p>
          <p className="text-xs text-gray-600">Crée un projet pour lui rattacher tâches, devis et heures.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(p => {
            const stats = statsFor(p.id)
            const client = clients.find(c => c.id === p.client_id)
            const lead = memberById(p.lead_id)
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                className="text-left bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${STATUS_COLORS[p.status] || STATUS_COLORS.active}`}>
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 flex-wrap">
                  {client && <span className="truncate">{client.name}</span>}
                  {client && p.project_type && <span>·</span>}
                  {p.project_type && <span>{TYPE_LABELS[p.project_type]}</span>}
                </div>

                {/* Avancement */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                    <span>{stats.done}/{stats.total} tâches</span>
                    <span>{stats.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${stats.progress}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {p.budget != null && <span className="text-green-400 font-medium">{formatCurrency(Number(p.budget))}</span>}
                    {stats.hours > 0 && <span>{stats.hours}h passées</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {p.end_date && (
                      <span className="text-[11px] text-gray-500">
                        {format(parseISO(p.end_date), 'd MMM', { locale: fr })}
                      </span>
                    )}
                    <Avatar profile={lead} size="sm" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProject(null) }}
        project={editingProject}
        clients={clients}
        onSave={handleSave}
        onDelete={handleDelete}
        onArchive={handleArchive}
      />
    </div>
  )
}
