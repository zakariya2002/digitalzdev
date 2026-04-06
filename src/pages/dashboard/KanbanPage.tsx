import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import KanbanBoard from '../../components/dashboard/KanbanBoard'
import TaskModal from '../../components/dashboard/TaskModal'
import ProjectModal from '../../components/dashboard/ProjectModal'
import type { Task, TaskStatus, TaskPriority, Project } from '../../types/database'

export default function KanbanPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('')

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('created_at')
    if (error) console.error('Fetch projects error:', error)
    if (data) setProjects(data as Project[])
  }, [])

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    let query = supabase.from('tasks').select('*').order('position')
    if (selectedProjectId) {
      query = query.eq('project_id', selectedProjectId)
    }
    const { data, error } = await query
    if (error) console.error('Fetch tasks error:', error)
    if (data) setTasks(data as Task[])
  }, [selectedProjectId])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Filtered tasks
  const filteredTasks = filterPriority
    ? tasks.filter(t => t.priority === filterPriority)
    : tasks

  // Move task (drag & drop)
  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }
          : t
      )
    )
    const { error } = await supabase.from('tasks').update({
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    }).eq('id', taskId)
    if (error) console.error('Move task error:', error)
  }

  // Save task
  const handleSaveTask = async (data: {
    title: string
    description: string
    priority: TaskPriority
    deadline: string
    tags: string[]
    project_id: string | null
  }) => {
    if (editingTask) {
      const { error } = await supabase.from('tasks').update({
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        deadline: data.deadline || null,
        tags: data.tags,
        project_id: data.project_id,
      }).eq('id', editingTask.id)
      if (error) console.error('Update task error:', error)
    } else {
      const maxPos = tasks.filter(t => t.status === 'todo').length
      const { error } = await supabase.from('tasks').insert({
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        deadline: data.deadline || null,
        tags: data.tags,
        project_id: data.project_id,
        status: 'todo',
        position: maxPos,
      })
      if (error) console.error('Insert task error:', error)
    }
    setEditingTask(null)
    fetchTasks()
  }

  // Delete task
  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) console.error('Delete task error:', error)
    setEditingTask(null)
    fetchTasks()
  }

  // Save project
  const handleSaveProject = async (data: Record<string, unknown>) => {
    if (editingProject) {
      const { error } = await supabase.from('projects').update(data).eq('id', editingProject.id)
      if (error) console.error('Update project error:', error)
    } else {
      const { error } = await supabase.from('projects').insert(data)
      if (error) console.error('Insert project error:', error)
    }
    setEditingProject(null)
    fetchProjects()
  }

  // Delete project
  const handleDeleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) console.error('Delete project error:', error)
    if (selectedProjectId === id) setSelectedProjectId(null)
    setEditingProject(null)
    fetchProjects()
    fetchTasks()
  }

  // Archive project
  const handleArchiveProject = async (id: string, archived: boolean) => {
    const { error } = await supabase.from('projects').update({ is_archived: archived }).eq('id', id)
    if (error) console.error('Archive project error:', error)
    if (archived && selectedProjectId === id) setSelectedProjectId(null)
    fetchProjects()
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Project tabs */}
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

        <div className="flex items-center gap-3">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | '')}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Toutes priorités</option>
            <option value="urgent">Urgent</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          {/* New task */}
          <button
            onClick={() => { setEditingTask(null); setTaskModalOpen(true) }}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            + Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Board */}
      <KanbanBoard
        tasks={filteredTasks}
        projects={projects}
        onMoveTask={handleMoveTask}
        onClickTask={(task) => { setEditingTask(task); setTaskModalOpen(true) }}
      />

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null) }}
        task={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Project Modal */}
      <ProjectModal
        open={projectModalOpen}
        onClose={() => { setProjectModalOpen(false); setEditingProject(null) }}
        project={editingProject}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        onArchive={handleArchiveProject}
      />
    </div>
  )
}
