import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import type { Task, TaskStatus, Project } from '../../types/database'

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'À faire' },
  { id: 'in_progress', label: 'En cours' },
  { id: 'review', label: 'En review' },
  { id: 'done', label: 'Terminé' },
]

interface KanbanBoardProps {
  tasks: Task[]
  projects: Project[]
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void
  onClickTask: (task: Task) => void
}

export default function KanbanBoard({ tasks, projects, onMoveTask, onClickTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const overData = over.data.current

    // Dropped on a column
    let newStatus: TaskStatus | undefined
    if (overData?.type === 'column') {
      newStatus = overData.status as TaskStatus
    }
    // Dropped on a task card — use that card's status
    if (overData?.type === 'task') {
      newStatus = (overData.task as Task).status
    }

    if (newStatus) {
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== newStatus) {
        onMoveTask(taskId, newStatus)
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-10rem)]">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter(t => t.status === col.id)
          return (
            <Column
              key={col.id}
              id={col.id}
              label={col.label}
              count={columnTasks.length}
              tasks={columnTasks}
              projects={projectMap}
              onClickTask={onClickTask}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="w-64 opacity-90">
            <TaskCard task={activeTask} project={projectMap[activeTask.project_id || '']} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function Column({
  id,
  label,
  count,
  tasks,
  projects,
  onClickTask,
}: {
  id: TaskStatus
  label: string
  count: number
  tasks: Task[]
  projects: Record<string, Project>
  onClickTask: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: { type: 'column', status: id },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl transition-colors ${isOver ? 'bg-gray-800/60' : 'bg-gray-900/50'}`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-sm font-semibold text-gray-300">{label}</h3>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={projects[task.project_id || '']}
              onClick={() => onClickTask(task)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
