import { useState, useEffect, useCallback, useRef, useId, type FormEvent } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import Avatar from './Avatar'
import type { Comment, CommentEntity, Profile } from '../../types/database'

interface CommentThreadProps {
  entityType: CommentEntity
  entityId: string
  title?: string
  compact?: boolean
}

/** Premier mot du nom, utilisé comme poignée de mention : « Anissa Bekri » -> « Anissa » */
function handle(profile: Profile) {
  return profile.full_name.trim().split(/\s+/)[0]
}

/** Retrouve les membres cités dans le texte via @Prénom ou @Nom complet */
function resolveMentions(body: string, members: Profile[]): string[] {
  const lower = body.toLowerCase()
  return members
    .filter(m => lower.includes(`@${handle(m).toLowerCase()}`) || lower.includes(`@${m.full_name.toLowerCase()}`))
    .map(m => m.id)
}

/** Découpe le texte pour mettre les mentions en évidence */
function renderBody(body: string, members: Profile[]) {
  const names = members.map(handle).filter(Boolean)
  if (names.length === 0) return body
  const pattern = new RegExp(`(@(?:${names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}))`, 'gi')
  return body.split(pattern).map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-blue-400 font-medium">{part}</span>
      : <span key={i}>{part}</span>
  )
}

export default function CommentThread({ entityType, entityId, title = 'Discussion', compact = false }: CommentThreadProps) {
  const { profile, members, memberById } = useTeam()
  const instanceId = useId()
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchComments = useCallback(async () => {
    const { data, error: e } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at')
    if (e) { console.error('Fetch comments error:', e); return }
    setComments((data || []) as Comment[])
  }, [entityType, entityId])

  useEffect(() => { fetchComments() }, [fetchComments])

  // Mise à jour en direct : l'autre membre voit le message sans recharger
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${entityType}-${entityId}-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `entity_id=eq.${entityId}` },
        () => { fetchComments() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [entityType, entityId, fetchComments, instanceId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || !profile) return
    setSending(true)
    setError(null)
    const { error: insertError } = await supabase.from('comments').insert({
      entity_type: entityType,
      entity_id: entityId,
      author_id: profile.id,
      body: text,
      mentions: resolveMentions(text, members),
    })
    setSending(false)
    if (insertError) {
      setError("Le message n'a pas pu être envoyé. Réessaie.")
      console.error('Insert comment error:', insertError)
      return
    }
    setBody('')
    fetchComments()
  }

  const handleDelete = async (id: string) => {
    const { error: e } = await supabase.from('comments').delete().eq('id', id)
    if (e) { setError('Suppression impossible.'); return }
    fetchComments()
  }

  const insertMention = (member: Profile) => {
    setBody(prev => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}@${handle(member)} `)
    textareaRef.current?.focus()
  }

  const others = members.filter(m => m.id !== profile?.id)

  return (
    <div className={compact ? '' : 'bg-gray-900 border border-gray-800 rounded-xl p-5'}>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="text-xs text-gray-500">{comments.length} message{comments.length > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-xs text-gray-500">Aucun message. Lance la discussion ici plutôt que sur WhatsApp.</p>
        )}
        {comments.map(c => {
          const author = memberById(c.author_id)
          const isMine = c.author_id === profile?.id
          return (
            <div key={c.id} className="flex gap-2.5 group">
              <Avatar profile={author} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-white">{author?.full_name || 'Membre supprimé'}</span>
                  <span className="text-[10px] text-gray-500">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr })}
                  </span>
                  {isMine && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="ml-auto text-[10px] text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                  {renderBody(c.body, members)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e)
          }}
          rows={compact ? 2 : 3}
          placeholder="Écrire un message… (Cmd+Entrée pour envoyer)"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
          >
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
          {others.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => insertMention(m)}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title={`Mentionner ${m.full_name}`}
            >
              @{handle(m)}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}
