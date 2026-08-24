import { useState, useEffect, useCallback, useId } from 'react'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import KanbanBoard from '../../components/dashboard/KanbanBoard'
import TaskModal from '../../components/dashboard/TaskModal'
import ProjectModal from '../../components/dashboard/ProjectModal'
import Avatar from '../../components/dashboard/Avatar'
import type { ProjectInsert, Task, TaskStatus, TaskPriority, TaskKind, BugSeverity, Project, Client } from '../../types/database'

type AssigneeFilter = 'all' | 'mine' | 'unassigned' | string

export default function KanbanPage() {
  const { profile, members } = useTeam()
  const instanceId = useId()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('')
  const [filterAssignee, setFilterAssignee] = useState<AssigneeFilter>('all')
  const [filterKind, setFilterKind] = useState<TaskKind | ''>('')
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const fetchProjects = useCallback(async () => {
    const [{ data, error: e }, { data: c }] = await Promise.all([
      supabase.from('projects').select('*').eq('is_archived', false).order('created_at'),
      supabase.from('clients').select('*').order('name'),
    ])
    if (e) setError('Impossible de charger les projets.')
    if (data) setProjects(data as Project[])
    if (c) setClients(c as Client[])
  }, [])

  const fetchTasks = useCallback(async () => {
    let query = supabase.from('tasks').select('*').order('position')
    if (selectedProjectId) {
      query = query.eq('project_id', selectedProjectId)
    }
    const { data, error: e } = await query
    if (e) setError('Impossible de charger les tâches.')
    if (data) setTasks(data as Task[])
  }, [selectedProjectId])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Synchronisation en direct : l'autre membre voit les cartes bouger
  useEffect(() => {
    const channel = supabase
      .channel(`kanban-tasks-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => { fetchTasks() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchTasks, instanceId])

  const filteredTasks = tasks
    .filter(t => !filterKind || (t.kind || 'task') === filterKind)
    .filter(t => !filterPriority || t.priority === filterPriority)
    .filter(t => {
      if (filterAssignee === 'all') return true
      if (filterAssignee === 'mine') return t.assignee_id === profile?.id
      if (filterAssignee === 'unassigned') return !t.assignee_id
      return t.assignee_id === filterAssignee
    })

  const myOpenCount = tasks.filter(t => t.assignee_id === profile?.id && t.status !== 'done').length

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus, newIndex: number) => {
    const previous = tasks
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, position: newIndex, completed_at: newStatus === 'done' ? new Date().toISOString() : null }
          : t
      )
    )
    const { error: e } = await supabase.rpc('move_task', {
      p_task_id: taskId,
      p_status: newStatus,
      p_position: newIndex,
    })
    if (e) {
      setError("Le déplacement n'a pas été enregistré.")
      setTasks(previous)
      return
    }
    fetchTasks()
  }

  const handleSaveTask = async (data: {
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
  }) => {
    const payload = {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      deadline: data.deadline || null,
      tags: data.tags,
      project_id: data.project_id,
      assignee_id: data.assignee_id,
      estimated_hours: data.estimated_hours,
      kind: data.kind,
      severity: data.severity,
      steps_to_reproduce: data.steps_to_reproduce,
    }

    if (editingTask) {
      const { error: e } = await supabase.from('tasks').update(payload).eq('id', editingTask.id)
      if (e) { setError("La tâche n'a pas pu être modifiée."); throw e }
    } else {
      // Position = juste après la dernière carte de la colonne, jamais un décompte
      const maxPos = tasks
        .filter(t => t.status === 'todo')
        .reduce((max, t) => Math.max(max, t.position ?? 0), -1)
      const { error: e } = await supabase.from('tasks').insert({
        ...payload,
        status: 'todo',
        position: maxPos + 1,
      })
      if (e) { setError("La tâche n'a pas pu être créée."); throw e }
    }
    setError(null)
    setEditingTask(null)
    fetchTasks()
  }

  const handleDeleteTask = async (id: string) => {
    const { error: e } = await supabase.from('tasks').delete().eq('id', id)
    if (e) setError("La tâche n'a pas pu être supprimée.")
    setEditingTask(null)
    fetchTasks()
  }

  const handleSaveProject = async (data: ProjectInsert) => {
    if (editingProject) {
      const { error: e } = await supabase.from('projects').update(data).eq('id', editingProject.id)
      if (e) setError("Le projet n'a pas pu être modifié.")
    } else {
      const { error: e } = await supabase.from('projects').insert(data)
      if (e) setError("Le projet n'a pas pu être créé.")
    }
    setEditingProject(null)
    fetchProjects()
  }

  const handleDeleteProject = async (id: string) => {
    const { error: e } = await supabase.from('projects').delete().eq('id', id)
    if (e) setError("Le projet n'a pas pu être supprimé.")
    if (selectedProjectId === id) setSelectedProjectId(null)
    setEditingProject(null)
    fetchProjects()
    fetchTasks()
  }

  const handleArchiveProject = async (id: string, archived: boolean) => {
    const { error: e } = await supabase.from('projects').update({ is_archived: archived }).eq('id', id)
    if (e) setError("Le projet n'a pas pu être archivé.")
    if (archived && selectedProjectId === id) setSelectedProjectId(null)
    fetchProjects()
  }

  const selectClass = 'px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500'

  return (
    <div className="p-6 h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedProjectId(null)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !selectedProjectId ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Tous
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              onDoubleClick={() => { setEditingProject(p); setProjectModalOpen(true) }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedProjectId === p.id ? 'text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
              style={selectedProjectId === p.id ? { backgroundColor: p.color + '20', color: p.color } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </button>
          ))}
          <button
            onClick={() => { setEditingProject(null); setProjectModalOpen(true) }}
            className="px-2.5 py-1.5 text-sm rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Nouveau projet"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Mes tâches */}
          <button
            onClick={() => setFilterAssignee(filterAssignee === 'mine' ? 'all' : 'mine')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterAssignee === 'mine' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Avatar profile={profile} size="xs" />
            Mes tâches
            <span className={`text-xs px-1.5 rounded-full ${filterAssignee === 'mine' ? 'bg-blue-700' : 'bg-gray-700'}`}>
              {myOpenCount}
            </span>
          </button>

          <select
            value={filterAssignee === 'mine' ? 'all' : filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value as AssigneeFilter)}
            className={selectClass}
          >
            <option value="all">Toute l'équipe</option>
            <option value="unassigned">Non assignées</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>

          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value as TaskKind | '')}
            className={selectClass}
          >
            <option value="">Tâches et bugs</option>
            <option value="task">Tâches seules</option>
            <option value="bug">Bugs seuls</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | '')}
            className={selectClass}
          >
            <option value="">Toutes priorités</option>
            <option value="urgent">Urgent</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          <button
            onClick={() => { setEditingTask(null); setTaskModalOpen(true) }}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            + Nouvelle tâche
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center justify-between gap-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-400 hover:text-red-300">Fermer</button>
        </div>
      )}

      <KanbanBoard
        tasks={filteredTasks}
        projects={projects}
        members={members}
        onMoveTask={handleMoveTask}
        onClickTask={(task) => { setEditingTask(task); setTaskModalOpen(true) }}
      />

      <TaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null) }}
        task={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
        defaultAssigneeId={filterAssignee === 'mine' ? profile?.id ?? null : null}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      <ProjectModal
        open={projectModalOpen}
        onClose={() => { setProjectModalOpen(false); setEditingProject(null) }}
        project={editingProject}
        clients={clients}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        onArchive={handleArchiveProject}
      />
    </div>
  )
}
