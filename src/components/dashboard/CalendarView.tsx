import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, addWeeks, subWeeks,
  startOfDay, parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Task, CalendarEvent, Project } from '../../types/database'

type ViewMode = 'month' | 'week'

interface CalendarItem {
  id: string
  title: string
  date: Date
  type: 'task' | 'event'
  color: string
  allDay?: boolean
  time?: string
}

interface CalendarViewProps {
  currentDate: Date
  viewMode: ViewMode
  tasks: Task[]
  events: CalendarEvent[]
  projects: Project[]
  onChangeDate: (date: Date) => void
  onChangeViewMode: (mode: ViewMode) => void
  onClickDay: (date: Date) => void
  onClickEvent: (event: CalendarEvent) => void
}

export default function CalendarView({
  currentDate, viewMode, tasks, events, projects, onChangeDate, onChangeViewMode, onClickDay, onClickEvent,
}: CalendarViewProps) {
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))

  // Build calendar items
  const items: CalendarItem[] = [
    ...tasks
      .filter(t => t.deadline)
      .map(t => ({
        id: t.id,
        title: t.title,
        date: parseISO(t.deadline!),
        type: 'task' as const,
        color: projectMap[t.project_id || '']?.color || '#6B7280',
        allDay: true,
      })),
    ...events.map(e => ({
      id: e.id,
      title: e.title,
      date: new Date(e.start_time),
      type: 'event' as const,
      color: projectMap[e.project_id || '']?.color || '#6B7280',
      allDay: e.all_day,
      time: e.all_day ? undefined : format(new Date(e.start_time), 'HH:mm'),
    })),
  ]

  // Get days to display
  let days: Date[]
  if (viewMode === 'month') {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const start = startOfWeek(monthStart, { weekStartsOn: 1 })
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 })
    days = eachDayOfInterval({ start, end })
  } else {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  }

  const navigate = (dir: number) => {
    if (viewMode === 'month') {
      onChangeDate(dir > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    } else {
      onChangeDate(dir > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    }
  }

  const goToday = () => onChangeDate(new Date())

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white capitalize">
            {viewMode === 'month'
              ? format(currentDate, 'MMMM yyyy', { locale: fr })
              : `Semaine du ${format(days[0], 'd MMM', { locale: fr })} au ${format(days[6], 'd MMM yyyy', { locale: fr })}`
            }
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 hover:text-white rounded-lg transition-colors">
            Aujourd'hui
          </button>
          <button onClick={() => navigate(-1)} className="p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="ml-2 flex bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => onChangeViewMode('week')}
              className={`px-3 py-1.5 text-sm transition-colors ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Semaine
            </button>
            <button
              onClick={() => onChangeViewMode('month')}
              className={`px-3 py-1.5 text-sm transition-colors ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 flex-1 ${viewMode === 'week' ? 'grid-rows-1' : ''} gap-px bg-gray-800 rounded-lg overflow-hidden`}>
        {days.map((day) => {
          const dayItems = items.filter(item => isSameDay(startOfDay(item.date), startOfDay(day)))
          const inMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true
          const today = isToday(day)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onClickDay(day)}
              className={`bg-gray-900 p-1.5 cursor-pointer hover:bg-gray-800/80 transition-colors ${
                viewMode === 'week' ? 'min-h-[calc(100vh-16rem)]' : 'min-h-[100px]'
              } ${!inMonth ? 'opacity-40' : ''}`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full mb-1 ${
                today ? 'bg-blue-600 text-white font-bold' : 'text-gray-400'
              }`}>
                {format(day, 'd')}
              </span>

              <div className="space-y-0.5">
                {dayItems.slice(0, viewMode === 'week' ? 20 : 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (item.type === 'event') {
                        const ev = events.find(ev => ev.id === item.id)
                        if (ev) onClickEvent(ev)
                      }
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: item.color + '20', color: item.color }}
                  >
                    {item.time && <span className="font-medium">{item.time}</span>}
                    <span className={item.type === 'task' ? 'italic' : ''}>{item.title}</span>
                  </div>
                ))}
                {dayItems.length > (viewMode === 'week' ? 20 : 3) && (
                  <span className="text-[10px] text-gray-500 pl-1">
                    +{dayItems.length - (viewMode === 'week' ? 20 : 3)} autres
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
