import { useNavigate } from 'react-router-dom'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTeam } from '../../contexts/TeamContext'
import Avatar from './Avatar'
import type { Task, Project } from '../../types/database'

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500',
}

interface MyWeekProps {
  tasks: Task[]
  projects: Project[]
}

/** Tâches qui m'incombent, triées par urgence réelle : en retard, puis échéance la plus proche */
export default function MyWeek({ tasks, projects }: MyWeekProps) {
  const navigate = useNavigate()
  const { profile } = useTeam()

  const mine = tasks
    .filter(t => t.assignee_id === profile?.id && t.status !== 'done')
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    })
    .slice(0, 8)

  const today = new Date()
  const lateCount = tasks.filter(
    t => t.assignee_id === profile?.id && t.status !== 'done' && t.deadline && t.deadline < format(today, 'yyyy-MM-dd')
  ).length

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Avatar profile={profile} size="sm" />
          <h3 className="text-sm font-semibold text-white">Ma semaine</h3>
        </div>
        {lateCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
            {lateCount} en retard
          </span>
        )}
      </div>

      {mine.length === 0 ? (
        <p className="text-xs text-gray-500">
          Aucune tâche ne t'est assignée. Ouvre le Kanban pour en prendre une.
        </p>
      ) : (
        <div className="space-y-1.5">
          {mine.map(task => {
            const project = projects.find(p => p.id === task.project_id)
            const days = task.deadline ? differenceInCalendarDays(parseISO(task.deadline), today) : null
            const late = days != null && days < 0
            return (
              <button
                key={task.id}
                onClick={() => navigate('/dashboard/kanban')}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{task.title}</p>
                  {project && (
                    <p className="text-[10px] text-gray-500 truncate">{project.name}</p>
                  )}
                </div>
                {task.deadline && (
                  <span className={`text-[10px] font-medium flex-shrink-0 ${late ? 'text-red-400' : days === 0 ? 'text-orange-400' : 'text-gray-500'}`}>
                    {late ? 'En retard' : days === 0 ? "Auj." : format(parseISO(task.deadline), 'd MMM', { locale: fr })}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
