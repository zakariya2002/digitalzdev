import { useState, useEffect, useCallback, useId } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import Avatar from './Avatar'
import type { ActivityEntry } from '../../types/database'

const ACTION_COLOR: Record<string, string> = {
  created: 'bg-blue-500',
  status_changed: 'bg-amber-500',
  assigned: 'bg-purple-500',
  commented: 'bg-emerald-500',
}

interface ActivityFeedProps {
  /** Limite le journal à un projet ; sinon affiche toute l'équipe */
  projectId?: string
  limit?: number
  title?: string
  compact?: boolean
}

/** Qui a fait quoi, et quand. Alimenté par les déclencheurs de la base. */
export default function ActivityFeed({ projectId, limit = 20, title = 'Activité', compact = false }: ActivityFeedProps) {
  const { memberById } = useTeam()
  const instanceId = useId()
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivity = useCallback(async () => {
    let query = supabase
      .from('activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (projectId) query = query.eq('project_id', projectId)

    const { data, error } = await query
    if (error) console.error('Fetch activity error:', error)
    setEntries((data || []) as ActivityEntry[])
    setLoading(false)
  }, [projectId, limit])

  useEffect(() => { fetchActivity() }, [fetchActivity])

  useEffect(() => {
    const channel = supabase
      .channel(`activity-${projectId || 'all'}-${instanceId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity' }, () => { fetchActivity() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [projectId, fetchActivity, instanceId])

  const body = (
    <>
      {loading ? (
        <p className="text-xs text-gray-500">Chargement…</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-gray-500">
          Rien pour l'instant. Chaque création, changement de statut et assignation apparaîtra ici.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const actor = memberById(entry.actor_id)
            return (
              <div key={entry.id} className="flex items-start gap-2.5">
                <div className="relative flex-shrink-0 mt-0.5">
                  <Avatar profile={actor} size="sm" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-gray-900 ${ACTION_COLOR[entry.action] || 'bg-gray-500'}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-300 leading-snug break-words">
                    <span className="font-medium text-white">{actor?.full_name || 'Système'}</span>{' '}
                    {entry.summary}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  if (compact) return body

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {body}
    </div>
  )
}
