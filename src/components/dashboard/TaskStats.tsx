import type { Task, Project } from '../../types/database'

interface TaskStatsProps {
  tasks: Task[]
  projects: Project[]
}

export default function TaskStats({ tasks, projects }: TaskStatsProps) {
  // Completion by project
  const projectStats = projects.map(p => {
    const projectTasks = tasks.filter(t => t.project_id === p.id)
    const done = projectTasks.filter(t => t.status === 'done').length
    const total = projectTasks.length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    return { project: p, done, total, pct }
  }).filter(s => s.total > 0)

  // Overdue tasks
  const today = new Date().toISOString().split('T')[0]
  const overdueTasks = tasks.filter(t =>
    t.deadline && t.deadline < today && t.status !== 'done'
  )

  return (
    <div className="space-y-4">
      {/* Completion by project */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Complétion par projet</h3>
        {projectStats.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Aucune tâche</p>
        ) : (
          <div className="space-y-3">
            {projectStats.map(({ project, done, total, pct }) => (
              <div key={project.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-sm text-gray-300">{project.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{done}/{total} ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overdue tasks */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">
          Tâches en retard
          {overdueTasks.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
              {overdueTasks.length}
            </span>
          )}
        </h3>
        {overdueTasks.length === 0 ? (
          <p className="text-sm text-green-400 text-center py-4">Aucune tâche en retard</p>
        ) : (
          <div className="space-y-2">
            {overdueTasks.slice(0, 5).map(task => {
              const project = projects.find(p => p.id === task.project_id)
              return (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{task.title}</p>
                    <p className="text-[10px] text-gray-500">
                      {project?.name} — Deadline: {task.deadline}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
