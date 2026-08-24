import { useState, useEffect, type FormEvent } from 'react'
import Modal from './Modal'
import AssigneeSelect from './AssigneeSelect'
import CommentThread from './CommentThread'
import SubtaskList from './SubtaskList'
import { useTimer } from '../../contexts/TimerContext'
import type { Project, Task, TaskPriority, TaskKind, BugSeverity } from '../../types/database'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  task: Task | null
  projects: Project[]
  defaultProjectId?: string | null
  defaultAssigneeId?: string | null
  onSave: (data: {
    title: string
    description: string
    priority: TaskPriority
    deadline: string
    tags: string[]
    project_id: string | null
    assignee_id: string | null
    estimated_hours: number | null
    kind: TaskKind
    severity: BugSeverity | null
    steps_to_reproduce: string | null
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { value: 'high', label: 'Haute', color: 'bg-orange-500' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-500' },
  { value: 'low', label: 'Basse', color: 'bg-green-500' },
]

export default function TaskModal({ open, onClose, task, projects, defaultProjectId, defaultAssigneeId, onSave, onDelete }: TaskModalProps) {
  const { start, stop, running, timer } = useTimer()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [deadline, setDeadline] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [estimatedHours, setEstimatedHours] = useState('')
  const [kind, setKind] = useState<TaskKind>('task')
  const [severity, setSeverity] = useState<BugSeverity>('major')
  const [steps, setSteps] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setDeadline(task.deadline || '')
      setTagsInput((task.tags || []).join(', '))
      setProjectId(task.project_id || '')
      setAssigneeId(task.assignee_id || null)
      setEstimatedHours(task.estimated_hours != null ? String(task.estimated_hours) : '')
      setKind(task.kind || 'task')
      setSeverity(task.severity || 'major')
      setSteps(task.steps_to_reproduce || '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDeadline('')
      setTagsInput('')
      setProjectId(defaultProjectId || '')
      setAssigneeId(defaultAssigneeId || null)
      setEstimatedHours('')
      setKind('task')
      setSeverity('major')
      setSteps('')
    }
  }, [task, open, defaultProjectId, defaultAssigneeId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    try {
      await onSave({
        title: title.trim(),
        description,
        priority,
        deadline,
        tags,
        project_id: projectId || null,
        assignee_id: assigneeId,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        kind,
        severity: kind === 'bug' ? severity : null,
        steps_to_reproduce: kind === 'bug' ? (steps || null) : null,
      })
      setLoading(false)
      onClose()
    } catch {
      setLoading(false)
      setError("L'enregistrement a échoué. Vérifie ta connexion et réessaie.")
    }
  }

  const inputClass = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500'

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Modifier la tâche' : 'Nouvelle tâche'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          {(['task', 'bug'] as TaskKind[]).map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                kind === k
                  ? k === 'bug' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {k === 'bug' ? 'Bug' : 'Tâche'}
            </button>
          ))}
          {kind === 'bug' && (
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as BugSeverity)}
              className="ml-auto px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="critical">Bloquant</option>
              <option value="major">Majeur</option>
              <option value="minor">Mineur</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
            placeholder="Ma tâche"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Description optionnelle..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AssigneeSelect value={assigneeId} onChange={setAssigneeId} />

          <div>
            <label className="block text-sm text-gray-400 mb-1">Projet</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={inputClass}
            >
              <option value="">Aucun projet</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Priorité</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className={inputClass}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Estimation (h)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className={inputClass}
              placeholder="4"
            />
          </div>
        </div>

        {kind === 'bug' && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Étapes pour reproduire</label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder={'1. Aller sur…\n2. Cliquer sur…\n3. Le bug apparaît'}
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Tags (séparés par des virgules)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={inputClass}
            placeholder="design, frontend"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

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

      {task && (
        <>
          <div className="mt-5 pt-5 border-t border-gray-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Temps passé</p>
              <p className="text-xs text-gray-500">
                {(task.actual_hours || 0).toFixed(2)}h enregistrées
                {task.estimated_hours ? ` sur ${task.estimated_hours}h estimées` : ''}
              </p>
            </div>
            {running && timer?.task_id === task.id ? (
              <button
                type="button"
                onClick={() => stop()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Arrêter le chrono
              </button>
            ) : (
              <button
                type="button"
                onClick={() => start(task)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors"
              >
                Démarrer le chrono
              </button>
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-gray-800">
            <SubtaskList taskId={task.id} />
          </div>

          <div className="mt-5 pt-5 border-t border-gray-800">
            <h4 className="text-sm font-semibold text-white mb-3">Discussion</h4>
            <CommentThread entityType="task" entityId={task.id} compact />
          </div>
        </>
      )}
    </Modal>
  )
}
