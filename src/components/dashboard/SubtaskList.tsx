import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import type { Subtask } from '../../types/database'

interface SubtaskListProps {
  taskId: string
}

/** Découpe une tâche en points vérifiables, cochables par n'importe qui de l'équipe. */
export default function SubtaskList({ taskId }: SubtaskListProps) {
  const { profile } = useTeam()
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchSubtasks = useCallback(async () => {
    const { data, error: e } = await supabase
      .from('subtasks').select('*').eq('task_id', taskId).order('position')
    if (e) { console.error('Fetch subtasks error:', e); return }
    setSubtasks((data || []) as Subtask[])
  }, [taskId])

  useEffect(() => { fetchSubtasks() }, [fetchSubtasks])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    const text = title.trim()
    if (!text) return
    const position = subtasks.reduce((max, s) => Math.max(max, s.position), -1) + 1
    const { error: err } = await supabase.from('subtasks').insert({ task_id: taskId, title: text, position })
    if (err) { setError("Impossible d'ajouter ce point."); return }
    setTitle('')
    setError(null)
    fetchSubtasks()
  }

  const toggle = async (subtask: Subtask) => {
    const next = !subtask.is_done
    setSubtasks(prev => prev.map(s => s.id === subtask.id ? { ...s, is_done: next } : s))
    const { error: err } = await supabase.from('subtasks').update({
      is_done: next,
      done_at: next ? new Date().toISOString() : null,
      done_by: next ? profile?.id ?? null : null,
    }).eq('id', subtask.id)
    if (err) { setError('La mise à jour a échoué.'); fetchSubtasks() }
  }

  const remove = async (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id))
    await supabase.from('subtasks').delete().eq('id', id)
  }

  const done = subtasks.filter(s => s.is_done).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-white">Sous-tâches</h4>
        {subtasks.length > 0 && (
          <span className="text-xs text-gray-500 tabular-nums">{done}/{subtasks.length}</span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${(done / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      <div className="space-y-1 mb-2">
        {subtasks.map(subtask => (
          <div key={subtask.id} className="flex items-center gap-2 group">
            <button
              type="button"
              onClick={() => toggle(subtask)}
              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                subtask.is_done ? 'bg-blue-600 border-blue-600' : 'border-gray-600 hover:border-gray-400'
              }`}
              aria-label={subtask.is_done ? 'Décocher' : 'Cocher'}
            >
              {subtask.is_done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
            <span className={`text-sm flex-1 ${subtask.is_done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
              {subtask.title}
            </span>
            <button
              type="button"
              onClick={() => remove(subtask.id)}
              className="text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ajouter un point…"
          className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors"
        >
          Ajouter
        </button>
      </form>
    </div>
  )
}
