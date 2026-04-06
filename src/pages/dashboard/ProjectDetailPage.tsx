import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/business'
import Modal from '../../components/dashboard/Modal'
import type { Project, Task, TimeEntry, ProjectFile, Quote, Invoice, Client } from '../../types/database'

const TYPE_LABELS: Record<string, string> = {
  landing: 'Landing page', vitrine: 'Site vitrine', ecommerce: 'E-commerce',
  custom: 'Sur mesure', mobile: 'Mobile', maintenance: 'Maintenance', audit: 'Audit', other: 'Autre'
}
const STATUS_LABELS: Record<string, string> = {
  briefing: 'Briefing', design: 'Design', development: 'Développement',
  review: 'Recette', delivered: 'Livré', active: 'Actif', archived: 'Archivé'
}
const STATUS_COLORS: Record<string, string> = {
  briefing: 'bg-purple-500/20 text-purple-400', design: 'bg-pink-500/20 text-pink-400',
  development: 'bg-blue-500/20 text-blue-400', review: 'bg-amber-500/20 text-amber-400',
  delivered: 'bg-green-500/20 text-green-400', active: 'bg-emerald-500/20 text-emerald-400',
  archived: 'bg-gray-500/20 text-gray-400'
}

const TASK_STATUS_LABELS: Record<string, string> = {
  todo: 'A faire', in_progress: 'En cours', review: 'Recette', done: 'Terminé'
}
const TASK_STATUS_COLORS: Record<string, string> = {
  todo: 'bg-gray-500/20 text-gray-400', in_progress: 'bg-blue-500/20 text-blue-400',
  review: 'bg-amber-500/20 text-amber-400', done: 'bg-green-500/20 text-green-400'
}
const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent', high: 'Haute', medium: 'Moyenne', low: 'Basse'
}
const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400', high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-gray-500/20 text-gray-400'
}

const QUOTE_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon', sent: 'Envoyé', accepted: 'Accepté', rejected: 'Refusé', expired: 'Expiré'
}
const QUOTE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400', sent: 'bg-blue-500/20 text-blue-400',
  accepted: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400',
  expired: 'bg-amber-500/20 text-amber-400'
}
const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', partial: 'Partiel',
  overdue: 'En retard', cancelled: 'Annulée'
}
const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400', sent: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-green-500/20 text-green-400', partial: 'bg-amber-500/20 text-amber-400',
  overdue: 'bg-red-500/20 text-red-400', cancelled: 'bg-gray-500/20 text-gray-400'
}

const FILE_TYPE_OPTIONS = [
  { value: 'link', label: 'Link' },
  { value: 'figma', label: 'Figma' },
  { value: 'drive', label: 'Google Drive' },
  { value: 'github', label: 'GitHub' },
  { value: 'other', label: 'Autre' },
]

function FileTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'figma':
      return (
        <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5zM12 2h3.5a3.5 3.5 0 1 1 0 7H12V2zm0 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm-7 0A3.5 3.5 0 0 1 8.5 11H12v3.5a3.5 3.5 0 0 1-7 0zM5 12a3.5 3.5 0 0 1 3.5-3.5H12V16H8.5A3.5 3.5 0 0 1 5 12z" />
        </svg>
      )
    case 'drive':
      return (
        <svg className="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.71 3.5l-5.5 9.52 2.74 4.74h5.52L5 8.23 7.71 3.5zm1.42 0l7.58 13.12H22L14.42 3.5H9.13zm7.58 14.38H2.82L.08 13.36l2.74-4.73 7.58 13.12 2.06-3.56 4.25 7.37z" />
        </svg>
      )
    case 'github':
      return (
        <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
        </svg>
      )
    case 'link':
      return (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    default:
      return (
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
  }
}

const inputClass = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // Time entry modal
  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [timeTaskId, setTimeTaskId] = useState('')
  const [timeHours, setTimeHours] = useState('')
  const [timeDescription, setTimeDescription] = useState('')
  const [timeDate, setTimeDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // File modal
  const [fileModalOpen, setFileModalOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [fileType, setFileType] = useState<string>('link')

  const fetchAll = useCallback(async () => {
    if (!id) return
    const [
      { data: proj },
      { data: t },
      { data: te },
      { data: f },
      { data: q },
      { data: inv },
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('tasks').select('*').eq('project_id', id).order('position'),
      supabase.from('time_entries').select('*').eq('project_id', id).order('date', { ascending: false }),
      supabase.from('project_files').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('quotes').select('*, client:clients(id, name)').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*, client:clients(id, name)').eq('project_id', id).order('created_at', { ascending: false }),
    ])
    if (proj) {
      setProject(proj)
      if (proj.client_id) {
        const { data: cl } = await supabase.from('clients').select('*').eq('id', proj.client_id).single()
        if (cl) setClient(cl)
      }
    }
    if (t) setTasks(t)
    if (te) setTimeEntries(te)
    if (f) setFiles(f)
    if (q) setQuotes(q)
    if (inv) setInvoices(inv)
  }, [id])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleSaveTimeEntry = async () => {
    const hours = parseFloat(timeHours)
    if (!hours || !timeTaskId) return
    await supabase.from('time_entries').insert({
      task_id: timeTaskId,
      project_id: id,
      hours,
      description: timeDescription || null,
      date: timeDate,
    })
    // Update task actual_hours
    const task = tasks.find(t => t.id === timeTaskId)
    if (task) {
      await supabase.from('tasks').update({ actual_hours: (task.actual_hours || 0) + hours }).eq('id', timeTaskId)
    }
    setTimeModalOpen(false)
    setTimeHours('')
    setTimeDescription('')
    fetchAll()
  }

  const handleSaveFile = async () => {
    if (!fileName.trim() || !fileUrl.trim()) return
    await supabase.from('project_files').insert({
      project_id: id,
      name: fileName.trim(),
      url: fileUrl.trim(),
      file_type: fileType,
    })
    setFileModalOpen(false)
    setFileName('')
    setFileUrl('')
    fetchAll()
  }

  const handleDeleteFile = async (fileId: string) => {
    await supabase.from('project_files').delete().eq('id', fileId)
    fetchAll()
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  const doneTasks = tasks.filter(t => t.status === 'done').length
  const totalTasks = tasks.length
  const donePercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const totalHours = timeEntries.reduce((sum, te) => sum + te.hours, 0)
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0)

  const tabs = [
    { key: 'overview', label: "Vue d'ensemble" },
    { key: 'tasks', label: 'Tâches' },
    { key: 'files', label: 'Fichiers' },
    { key: 'financial', label: 'Financier' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {project.project_type && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                {TYPE_LABELS[project.project_type] || project.project_type}
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[project.status] || 'bg-gray-500/20 text-gray-400'}`}>
              {STATUS_LABELS[project.status] || project.status}
            </span>
            {client && (
              <Link
                to={`/dashboard/clients/${client.id}`}
                className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                {client.name}
              </Link>
            )}
          </div>
        </div>
        {project.budget !== null && project.budget !== undefined && (
          <div className="text-right">
            <div className="text-sm text-gray-400">Budget</div>
            <div className="text-xl font-bold text-white">{formatCurrency(project.budget)}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}

      {/* ===== Overview Tab ===== */}
      {activeTab === 'overview' && (
        <div>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Tâches terminées</div>
              <div className="text-2xl font-bold text-white">
                {doneTasks} / {totalTasks}
              </div>
              <div className="text-sm text-gray-500">{donePercent}%</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Temps total</div>
              <div className="text-2xl font-bold text-white">{totalHours.toFixed(1)}h</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Budget</div>
              <div className="text-2xl font-bold text-white">
                {project.budget !== null && project.budget !== undefined
                  ? formatCurrency(project.budget)
                  : 'Non défini'}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Période</div>
              <div className="text-lg font-bold text-white">
                {project.start_date || project.end_date ? (
                  <>
                    {project.start_date
                      ? format(new Date(project.start_date), 'dd MMM yyyy', { locale: fr })
                      : '—'}
                    {' — '}
                    {project.end_date
                      ? format(new Date(project.end_date), 'dd MMM yyyy', { locale: fr })
                      : '—'}
                  </>
                ) : (
                  'Non définie'
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
              <p className="text-white whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Progression</h3>
              <span className="text-sm text-white font-medium">{donePercent}%</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${donePercent}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {doneTasks} tâche{doneTasks > 1 ? 's' : ''} terminée{doneTasks > 1 ? 's' : ''} sur {totalTasks}
            </div>
          </div>
        </div>
      )}

      {/* ===== Tasks Tab ===== */}
      {activeTab === 'tasks' && (
        <div>
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Aucune tâche pour ce projet.</div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Titre</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Statut</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Priorité</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Temps</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Deadline</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => {
                      const timePercent =
                        task.estimated_hours && task.estimated_hours > 0
                          ? Math.min(100, Math.round((task.actual_hours / task.estimated_hours) * 100))
                          : 0
                      return (
                        <tr key={task.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm text-white font-medium">{task.title}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${TASK_STATUS_COLORS[task.status] || ''}`}>
                              {TASK_STATUS_LABELS[task.status] || task.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${PRIORITY_COLORS[task.priority] || ''}`}>
                              {PRIORITY_LABELS[task.priority] || task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">
                                {task.actual_hours.toFixed(1)}h
                                {task.estimated_hours ? ` / ${task.estimated_hours}h` : ''}
                              </span>
                              {task.estimated_hours && task.estimated_hours > 0 && (
                                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${timePercent >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${timePercent}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {task.deadline
                              ? format(new Date(task.deadline), 'dd/MM/yyyy')
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setTimeTaskId(task.id)
                                setTimeModalOpen(true)
                              }}
                              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Logger du temps
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Time Entry Modal */}
          <Modal open={timeModalOpen} onClose={() => setTimeModalOpen(false)} title="Logger du temps">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tâche</label>
                <select
                  value={timeTaskId}
                  onChange={e => setTimeTaskId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Sélectionner une tâche</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Heures</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={timeHours}
                  onChange={e => setTimeHours(e.target.value)}
                  placeholder="Ex: 1.5"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={timeDescription}
                  onChange={e => setTimeDescription(e.target.value)}
                  placeholder="Description optionnelle"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={timeDate}
                  onChange={e => setTimeDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setTimeModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTimeEntry}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ===== Files Tab ===== */}
      {activeTab === 'files' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setFileModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un lien
            </button>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Aucun fichier ou lien pour ce projet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <div key={file.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="shrink-0">
                    <FileTypeIcon type={file.file_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{file.name}</div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 truncate block mt-0.5 transition-colors"
                    >
                      Ouvrir le lien
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="shrink-0 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File Modal */}
          <Modal open={fileModalOpen} onClose={() => setFileModalOpen(false)} title="Ajouter un lien">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nom</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="Ex: Maquette Figma"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={fileType}
                  onChange={e => setFileType(e.target.value)}
                  className={inputClass}
                >
                  {FILE_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setFileModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveFile}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ===== Financial Tab ===== */}
      {activeTab === 'financial' && (
        <div>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Budget projet</div>
              <div className="text-2xl font-bold text-white">
                {project.budget !== null && project.budget !== undefined
                  ? formatCurrency(project.budget)
                  : '—'}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Montant facturé</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(totalInvoiced)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Montant encaissé</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(totalPaid)}</div>
            </div>
          </div>

          {/* Devis liés */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Devis liés</h3>
            {quotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
                Aucun devis lié à ce projet.
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Numéro</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Titre</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Montant</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map(quote => (
                        <tr
                          key={quote.id}
                          onClick={() => navigate(`/dashboard/quotes/${quote.id}`)}
                          className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 cursor-pointer"
                        >
                          <td className="px-4 py-3 text-sm text-blue-400 font-mono">{quote.quote_number}</td>
                          <td className="px-4 py-3 text-sm text-white">{quote.title}</td>
                          <td className="px-4 py-3 text-sm text-white font-medium">{formatCurrency(quote.total_amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${QUOTE_STATUS_COLORS[quote.status] || ''}`}>
                              {QUOTE_STATUS_LABELS[quote.status] || quote.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Factures liées */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Factures liées</h3>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
                Aucune facture liée à ce projet.
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Numéro</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Titre</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Montant</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Payé</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(invoice => (
                        <tr
                          key={invoice.id}
                          onClick={() => navigate(`/dashboard/invoices/${invoice.id}`)}
                          className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 cursor-pointer"
                        >
                          <td className="px-4 py-3 text-sm text-blue-400 font-mono">{invoice.invoice_number}</td>
                          <td className="px-4 py-3 text-sm text-white">{invoice.title}</td>
                          <td className="px-4 py-3 text-sm text-white font-medium">{formatCurrency(invoice.total_amount)}</td>
                          <td className="px-4 py-3 text-sm text-green-400 font-medium">{formatCurrency(invoice.paid_amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${INVOICE_STATUS_COLORS[invoice.status] || ''}`}>
                              {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
