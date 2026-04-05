import { useState, useEffect, type FormEvent } from 'react'
import Modal from './Modal'
import type { Project, Task, TaskPriority } from '../../types/database'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  task: Task | null
  projects: Project[]
  defaultProjectId?: string | null
  onSave: (data: {
    title: string
    description: string
    priority: TaskPriority
    deadline: string
    tags: string[]
    project_id: string | null
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { value: 'high', label: 'Haute', color: 'bg-orange-500' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-500' },
  { value: 'low', label: 'Basse', color: 'bg-green-500' },
]

export default function TaskModal({ open, onClose, task, projects, defaultProjectId, onSave, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [deadline, setDeadline] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setDeadline(task.deadline || '')
      setTagsInput((task.tags || []).join(', '))
      setProjectId(task.project_id || '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDeadline('')
      setTagsInput('')
      setProjectId(defaultProjectId || '')
    }
  }, [task, open, defaultProjectId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    await onSave({
      title: title.trim(),
      description,
      priority,
      deadline,
      tags,
      project_id: projectId || null,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Modifier la tâche' : 'Nouvelle tâche'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Ma tâche"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Description optionnelle..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Projet</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Aucun projet</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Priorité</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="design, frontend"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Enregistrement...' : task ? 'Modifier' : 'Créer'}
          </button>
          {task && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(task.id); onClose() }}
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
