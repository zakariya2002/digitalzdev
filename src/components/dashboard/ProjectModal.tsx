import { useState, useEffect, type FormEvent } from 'react'
import Modal from './Modal'
import type { Project, Client, ProjectType, ProjectStatus } from '../../types/database'

const COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#6366F1', '#A855F7', '#F43F5E',
]

const PROJECT_TYPE_LABELS: Record<string, string> = {
  landing: 'Landing page',
  vitrine: 'Site vitrine',
  ecommerce: 'E-commerce Shopify',
  custom: 'Site sur mesure',
  mobile: 'Application mobile',
  maintenance: 'Maintenance',
  audit: 'Audit SEO / technique',
  other: 'Autre',
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  briefing: 'Briefing',
  design: 'Design',
  development: 'Développement',
  review: 'Recette',
  delivered: 'Livré',
  active: 'Actif',
  archived: 'Archivé',
}

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
  clients?: Client[]
  onSave: (data: {
    name: string
    color: string
    client_id: string | null
    project_type: string | null
    status: string
    budget: number | null
    start_date: string | null
    end_date: string | null
    description: string | null
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onArchive?: (id: string, archived: boolean) => Promise<void>
}

export default function ProjectModal({ open, onClose, project, clients = [], onSave, onDelete, onArchive }: ProjectModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [clientId, setClientId] = useState<string | null>(null)
  const [projectType, setProjectType] = useState<string>('')
  const [status, setStatus] = useState<string>('active')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setColor(project.color)
      setClientId(project.client_id)
      setProjectType(project.project_type || '')
      setStatus(project.status || 'active')
      setBudget(project.budget ? String(project.budget) : '')
      setStartDate(project.start_date || '')
      setEndDate(project.end_date || '')
      setDescription(project.description || '')
    } else {
      setName('')
      setColor(COLORS[0])
      setClientId(null)
      setProjectType('')
      setStatus('active')
      setBudget('')
      setStartDate('')
      setEndDate('')
      setDescription('')
    }
  }, [project, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSave({
      name: name.trim(),
      color,
      client_id: clientId,
      project_type: projectType || null,
      status,
      budget: budget ? parseFloat(budget) : null,
      start_date: startDate || null,
      end_date: endDate || null,
      description: description || null,
    })
    setLoading(false)
    onClose()
  }

  const inputClass = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500'

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Modifier le projet' : 'Nouveau projet'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom du projet</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Mon projet" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Client associé</label>
            <select value={clientId || ''} onChange={(e) => setClientId(e.target.value || null)} className={inputClass}>
              <option value="">-- Aucun client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type de projet</label>
            <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className={inputClass}>
              <option value="">-- Sélectionner --</option>
              {Object.entries(PROJECT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {Object.entries(PROJECT_STATUS_LABELS).filter(([k]) => k !== 'archived').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Budget</label>
            <input type="number" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date de début</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date de fin</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Description du projet..." />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Couleur</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Enregistrement...' : project ? 'Modifier' : 'Créer'}
          </button>
          {project && onArchive && (
            <button
              type="button"
              onClick={() => { onArchive(project.id, !project.is_archived); onClose() }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              {project.is_archived ? 'Désarchiver' : 'Archiver'}
            </button>
          )}
          {project && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(project.id); onClose() }}
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
