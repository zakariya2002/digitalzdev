import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useTeam } from './TeamContext'
import type { ActiveTimer, Task } from '../types/database'

interface TimerContextType {
  timer: ActiveTimer | null
  taskTitle: string | null
  elapsedSeconds: number
  running: boolean
  start: (task: Task) => Promise<void>
  stop: (note?: string) => Promise<number | null>
  error: string | null
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const { profile } = useTeam()
  const [timer, setTimer] = useState<ActiveTimer | null>(null)
  const [taskTitle, setTaskTitle] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!profile) { setTimer(null); return }
    const { data } = await supabase.from('active_timers').select('*').eq('profile_id', profile.id).maybeSingle()
    if (!data) { setTimer(null); setTaskTitle(null); return }
    setTimer(data as ActiveTimer)
    const { data: task } = await supabase.from('tasks').select('title').eq('id', (data as ActiveTimer).task_id).maybeSingle()
    setTaskTitle(task?.title ?? null)
  }, [profile])

  useEffect(() => { load() }, [load])

  // Compteur visible, recalculé depuis l'heure de départ pour rester juste après une mise en veille
  useEffect(() => {
    if (!timer) { setElapsedSeconds(0); return }
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - new Date(timer.started_at).getTime()) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [timer])

  const start = useCallback(async (task: Task) => {
    if (!profile) return
    setError(null)
    // Un seul chronomètre à la fois : celui en cours est arrêté et comptabilisé
    if (timer) await supabase.rpc('stop_timer', {})
    const { error: e } = await supabase.from('active_timers').upsert({
      profile_id: profile.id,
      task_id: task.id,
      project_id: task.project_id,
      description: task.title,
      started_at: new Date().toISOString(),
    })
    if (e) { setError("Le chronomètre n'a pas pu démarrer."); return }
    await load()
  }, [profile, timer, load])

  const stop = useCallback(async (note?: string) => {
    if (!timer) return null
    setError(null)
    const { data, error: e } = await supabase.rpc('stop_timer', note ? { p_note: note } : {})
    if (e) { setError("Le temps n'a pas pu être enregistré."); return null }
    setTimer(null)
    setTaskTitle(null)
    const row = Array.isArray(data) ? (data[0] as { hours: number } | undefined) : undefined
    const hours = row ? Number(row.hours) : null
    return hours
  }, [timer])

  return (
    <TimerContext.Provider value={{ timer, taskTitle, elapsedSeconds, running: !!timer, start, stop, error }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) throw new Error('useTimer must be used within TimerProvider')
  return context
}
