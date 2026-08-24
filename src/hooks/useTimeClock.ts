import { useState, useEffect, useCallback, useId } from 'react'
import { supabase } from '../lib/supabase'
import { useTeam } from '../contexts/TeamContext'

export interface WorkSession {
  id: string
  profile_id: string
  started_at: string
  ended_at: string | null
  note: string | null
  is_manual: boolean
}

export interface WorkDay {
  profile_id: string
  day: string
  hours: number
  sessions: number
  first_in: string
  last_out: string
  is_open: boolean
}

/** Badgeuse : présence en cours et totaux par jour, pour soi et pour l'équipe. */
export function useTimeClock(days = 30) {
  const { profile } = useTeam()
  const instanceId = useId()
  const [sessions, setSessions] = useState<WorkSession[]>([])
  const [workDays, setWorkDays] = useState<WorkDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!profile) { setLoading(false); return }
    const since = new Date()
    since.setDate(since.getDate() - days)

    const [{ data: s, error: e }, { data: d }] = await Promise.all([
      supabase.from('work_sessions').select('*')
        .gte('started_at', since.toISOString())
        .order('started_at', { ascending: false }),
      supabase.from('work_days').select('*')
        .gte('day', since.toISOString().slice(0, 10))
        .order('day', { ascending: false }),
    ])
    if (e) setError('Impossible de charger les pointages.')
    setSessions((s || []) as unknown as WorkSession[])
    setWorkDays((d || []) as unknown as WorkDay[])
    setLoading(false)
  }, [profile, days])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Le pointage de l'autre apparaît sans recharger
  useEffect(() => {
    const channel = supabase
      .channel(`timeclock-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_sessions' }, () => { fetchAll() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll, instanceId])

  const openSession = sessions.find(s => s.profile_id === profile?.id && !s.ended_at) ?? null

  const punch = useCallback(async (note?: string) => {
    setError(null)
    const { data, error: e } = await supabase.rpc('punch', note ? { p_note: note } : {})
    if (e) { setError("Le pointage n'a pas pu être enregistré."); return null }
    await fetchAll()
    return data as { ok: boolean; action?: 'in' | 'out'; minutes?: number } | null
  }, [fetchAll])

  const addManual = useCallback(async (startedAt: string, endedAt: string, note?: string) => {
    if (!profile) return false
    const { error: e } = await supabase.from('work_sessions').insert({
      profile_id: profile.id, started_at: startedAt, ended_at: endedAt,
      note: note || null, is_manual: true,
    })
    if (e) { setError("La saisie n'a pas pu être ajoutée. Vérifie que l'heure de fin suit l'heure de début."); return false }
    await fetchAll()
    return true
  }, [profile, fetchAll])

  const removeSession = useCallback(async (id: string) => {
    const { error: e } = await supabase.from('work_sessions').delete().eq('id', id)
    if (e) { setError('Suppression impossible.'); return }
    await fetchAll()
  }, [fetchAll])

  return { sessions, workDays, openSession, loading, error, punch, addManual, removeSession, refresh: fetchAll }
}

/** Met une durée en heures sous la forme « 7 h 30 ». */
export function formatHours(hours: number) {
  const total = Math.round(hours * 60)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}
