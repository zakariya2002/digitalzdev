import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useTeam } from '../contexts/TeamContext'
import type { AppNotification } from '../types/database'

const PAGE_SIZE = 40

/** Notifications persistées du membre connecté, tenues à jour en direct. */
export function useNotifications() {
  const { profile } = useTeam()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!profile) { setNotifications([]); setLoading(false); return }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)
    if (error) console.error('Fetch notifications error:', error)
    setNotifications((data || []) as AppNotification[])
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // Une mention ou une assignation arrive sans recharger la page
  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel(`notifications-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${profile.id}` },
        () => { fetchNotifications() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile, fetchNotifications])

  const markRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
  }, [])

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString()
    setNotifications(prev => prev.map(n => n.read_at ? n : { ...n, read_at: now }))
    await supabase.from('notifications').update({ read_at: now }).is('read_at', null)
  }, [])

  const dismiss = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }, [])

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read_at).length,
    loading,
    markRead,
    markAllRead,
    dismiss,
    refresh: fetchNotifications,
  }
}
