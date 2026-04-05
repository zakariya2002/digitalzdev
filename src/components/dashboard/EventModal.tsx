import { useState, useEffect, type FormEvent } from 'react'
import Modal from './Modal'
import type { CalendarEvent, Project } from '../../types/database'

interface EventModalProps {
  open: boolean
  onClose: () => void
  event: CalendarEvent | null
  projects: Project[]
  defaultDate?: string
  onSave: (data: {
    title: string
    description: string
    start_time: string
    end_time: string
    all_day: boolean
    project_id: string | null
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export default function EventModal({ open, onClose, event, projects, defaultDate, onSave, onDelete }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('10:00')
  const [allDay, setAllDay] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event) {
      const start = new Date(event.start_time)
      setTitle(event.title)
      setDescription(event.description || '')
      setStartDate(start.toISOString().split('T')[0])
      setStartTime(start.toTimeString().slice(0, 5))
      if (event.end_time) {
        const end = new Date(event.end_time)
        setEndDate(end.toISOString().split('T')[0])
        setEndTime(end.toTimeString().slice(0, 5))
      }
      setAllDay(event.all_day)
      setProjectId(event.project_id || '')
    } else {
      const d = defaultDate || new Date().toISOString().split('T')[0]
      setTitle('')
      setDescription('')
      setStartDate(d)
      setStartTime('09:00')
      setEndDate(d)
      setEndTime('10:00')
      setAllDay(false)
      setProjectId('')
    }
  }, [event, open, defaultDate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)

    const start_time = allDay ? `${startDate}T00:00:00` : `${startDate}T${startTime}:00`
    const end_time = allDay ? `${endDate || startDate}T23:59:59` : `${endDate || startDate}T${endTime}:00`

    await onSave({
      title: title.trim(),
      description,
      start_time,
      end_time,
      all_day: allDay,
      project_id: projectId || null,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={event ? "Modifier l'événement" : 'Nouvel événement'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Rendez-vous, call..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Projet (optionnel)</label>
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allDay"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="rounded bg-gray-800 border-gray-700"
          />
          <label htmlFor="allDay" className="text-sm text-gray-400">Toute la journée</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          {!allDay && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Heure de début</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          {!allDay && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Heure de fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Notes..."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Enregistrement...' : event ? 'Modifier' : 'Créer'}
          </button>
          {event && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(event.id); onClose() }}
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
