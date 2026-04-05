import { useState, useEffect, type FormEvent } from 'react'
import Modal from './Modal'
import type { Project } from '../../types/database'

const COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#6366F1', '#A855F7', '#F43F5E',
]

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
  onSave: (data: { name: string; color: string }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onArchive?: (id: string, archived: boolean) => Promise<void>
}

export default function ProjectModal({ open, onClose, project, onSave, onDelete, onArchive }: ProjectModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setColor(project.color)
    } else {
      setName('')
      setColor(COLORS[0])
    }
  }, [project, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSave({ name: name.trim(), color })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Modifier le projet' : 'Nouveau projet'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nom du projet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Mon projet"
          />
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
