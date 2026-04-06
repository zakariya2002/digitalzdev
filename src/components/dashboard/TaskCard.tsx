import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { differenceInDays, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Task, Project } from '../../types/database'

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
  high: { label: 'Haute', bg: 'bg-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-500' },
  medium: { label: 'Moyenne', bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  low: { label: 'Basse', bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-500' },
}

interface TaskCardProps {
  task: Task
  project?: Project
  onClick: () => void
}

export default function TaskCard({ task, project, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = PRIORITY_CONFIG[task.priority]
  const deadlineInfo = getDeadlineInfo(task.deadline, task.status)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-600 transition-colors ${isDragging ? 'opacity-50 shadow-xl' : ''}`}
    >
      {/* Project indicator */}
      {project && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
          <span className="text-xs text-gray-500">{project.name}</span>
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-white mb-2">{task.title}</p>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-gray-700 text-gray-300 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Time tracking indicator */}
      {task.estimated_hours != null && task.estimated_hours > 0 && (
        <div className="mt-2 mb-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
            <span>&#9201; {task.actual_hours || 0}h / {task.estimated_hours}h</span>
            <span>{Math.min(100, Math.round(((task.actual_hours || 0) / task.estimated_hours) * 100))}%</span>
          </div>
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${(task.actual_hours || 0) > task.estimated_hours ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, ((task.actual_hours || 0) / task.estimated_hours) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom row: priority + deadline */}
      <div className="flex items-center justify-between mt-1">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.bg} ${priority.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </span>

        {deadlineInfo && (
          <span className={`text-[10px] font-medium ${deadlineInfo.color}`}>
            {deadlineInfo.label}
          </span>
        )}
      </div>
    </div>
  )
}

function getDeadlineInfo(deadline: string | null, status: string) {
  if (!deadline || status === 'done') return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = parseISO(deadline)
  const diff = differenceInDays(deadlineDate, today)

  if (diff < 0) {
    return { label: `En retard (${format(deadlineDate, 'd MMM', { locale: fr })})`, color: 'text-red-400' }
  }
  if (diff === 0) {
    return { label: "Aujourd'hui", color: 'text-orange-400' }
  }
  if (diff <= 3) {
    return { label: `${diff}j restants`, color: 'text-orange-400' }
  }
  return { label: format(deadlineDate, 'd MMM', { locale: fr }), color: 'text-gray-500' }
}
