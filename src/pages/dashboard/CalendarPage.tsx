import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import CalendarView from '../../components/dashboard/CalendarView'
import EventModal from '../../components/dashboard/EventModal'
import type { Task, CalendarEvent, Project } from '../../types/database'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const fetchAll = useCallback(async () => {
    const [{ data: p }, { data: t }, { data: e }] = await Promise.all([
      supabase.from('projects').select('*').eq('is_archived', false).order('created_at'),
      supabase.from('tasks').select('*').not('deadline', 'is', null),
      supabase.from('events').select('*').order('start_time'),
    ])
    if (p) setProjects(p as Project[])
    if (t) setTasks(t as Task[])
    if (e) setEvents(e as CalendarEvent[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSaveEvent = async (data: {
    title: string
    description: string
    start_time: string
    end_time: string
    all_day: boolean
    project_id: string | null
  }) => {
    if (editingEvent) {
      await supabase.from('events').update({
        title: data.title,
        description: data.description || null,
        start_time: data.start_time,
        end_time: data.end_time,
        all_day: data.all_day,
        project_id: data.project_id,
      }).eq('id', editingEvent.id)
    } else {
      await supabase.from('events').insert({
        title: data.title,
        description: data.description || null,
        start_time: data.start_time,
        end_time: data.end_time,
        all_day: data.all_day,
        project_id: data.project_id,
      })
    }
    setEditingEvent(null)
    fetchAll()
  }

  const handleDeleteEvent = async (id: string) => {
    await supabase.from('events').delete().eq('id', id)
    setEditingEvent(null)
    fetchAll()
  }

  const handleClickDay = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'))
    setEditingEvent(null)
    setEventModalOpen(true)
  }

  const handleClickEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setEventModalOpen(true)
  }

  // Today's tasks
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayTasks = tasks.filter(t => t.deadline === today && t.status !== 'done')

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex gap-6">
      {/* Calendar */}
      <div className="flex-1 flex flex-col">
        <CalendarView
          currentDate={currentDate}
          viewMode={viewMode}
          tasks={tasks}
          events={events}
          projects={projects}
          onChangeDate={setCurrentDate}
          onChangeViewMode={setViewMode}
          onClickDay={handleClickDay}
          onClickEvent={handleClickEvent}
        />
      </div>

      {/* Today sidebar */}
      <div className="w-72 flex-shrink-0">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Aujourd'hui</h3>
          {todayTasks.length === 0 ? (
            <p className="text-xs text-gray-500">Aucune tâche pour aujourd'hui</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => {
                const project = projects.find(p => p.id === task.project_id)
                return (
                  <div key={task.id} className="flex items-start gap-2 p-2 bg-gray-800 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: project?.color || '#6B7280' }} />
                    <div>
                      <p className="text-xs font-medium text-white">{task.title}</p>
                      {project && <p className="text-[10px] text-gray-500">{project.name}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => { setEditingEvent(null); setSelectedDate(today); setEventModalOpen(true) }}
          className="mt-3 w-full px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nouvel événement
        </button>
      </div>

      {/* Event Modal */}
      <EventModal
        open={eventModalOpen}
        onClose={() => { setEventModalOpen(false); setEditingEvent(null) }}
        event={editingEvent}
        projects={projects}
        defaultDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}
