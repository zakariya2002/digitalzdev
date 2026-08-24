import { useState, useEffect, useCallback, useId } from 'react'
import { supabase } from '../lib/supabase'
import { useTeam } from '../contexts/TeamContext'

export interface Conversation {
  id: string
  kind: 'direct' | 'channel'
  name: string | null
  last_message_at: string
  /** Membres autres que soi — sert à nommer une conversation directe */
  otherIds: string[]
  lastReadAt: string
  unread: number
  preview: string | null
}

export interface Message {
  id: string
  conversation_id: string
  author_id: string | null
  body: string
  edited_at: string | null
  created_at: string
}

/** Conversations du membre connecté, avec leur compteur de messages non lus. */
export function useMessaging() {
  const { profile } = useTeam()
  // Identifiant propre à cette instance : le hook peut être monté plusieurs fois
  const instanceId = useId()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    if (!profile) { setConversations([]); setLoading(false); return }

    const [{ data: memberships, error: me }, { data: convs }] = await Promise.all([
      supabase.from('conversation_members').select('conversation_id, profile_id, last_read_at'),
      supabase.from('conversations').select('*').order('last_message_at', { ascending: false }),
    ])
    if (me) { setError('Impossible de charger les conversations.'); setLoading(false); return }

    const mine = (memberships || []).filter(m => m.profile_id === profile.id)
    const ids = mine.map(m => m.conversation_id)
    if (ids.length === 0) { setConversations([]); setLoading(false); return }

    // Derniers messages : sert au fois d'aperçu et de compteur
    const { data: recent } = await supabase
      .from('messages')
      .select('conversation_id, body, created_at, author_id')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false })
      .limit(300)

    const result: Conversation[] = (convs || [])
      .filter(c => ids.includes(c.id))
      .map(c => {
        const membership = mine.find(m => m.conversation_id === c.id)!
        const lastReadAt = membership.last_read_at
        const msgs = (recent || []).filter(m => m.conversation_id === c.id)
        return {
          id: c.id,
          kind: c.kind as 'direct' | 'channel',
          name: c.name,
          last_message_at: c.last_message_at,
          otherIds: (memberships || [])
            .filter(m => m.conversation_id === c.id && m.profile_id !== profile.id)
            .map(m => m.profile_id),
          lastReadAt,
          unread: msgs.filter(m => m.created_at > lastReadAt && m.author_id !== profile.id).length,
          preview: msgs[0]?.body ?? null,
        }
      })

    setConversations(result)
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  // Un message reçu ailleurs met la liste à jour sans rechargement
  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel(`messaging-overview-${instanceId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => { fetchConversations() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile, fetchConversations, instanceId])

  const openDirect = useCallback(async (otherId: string) => {
    const { data, error: e } = await supabase.rpc('open_direct_conversation', { p_other: otherId })
    if (e) { setError("La conversation n'a pas pu être ouverte."); return null }
    await fetchConversations()
    return data as string
  }, [fetchConversations])

  const markRead = useCallback(async (conversationId: string) => {
    if (!profile) return
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c))
    await supabase.from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('profile_id', profile.id)
  }, [profile])

  return {
    conversations,
    totalUnread: conversations.reduce((sum, c) => sum + c.unread, 0),
    loading,
    error,
    refresh: fetchConversations,
    openDirect,
    markRead,
  }
}
