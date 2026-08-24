import { useState, useEffect, useCallback, useRef, useId, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import { useMessaging, type Message } from '../../hooks/useMessaging'
import Avatar from '../../components/dashboard/Avatar'
import ErrorBanner from '../../components/dashboard/ErrorBanner'

function dayLabel(iso: string) {
  const d = parseISO(iso)
  if (isToday(d)) return "Aujourd'hui"
  if (isYesterday(d)) return 'Hier'
  return format(d, 'EEEE d MMMM', { locale: fr })
}

export default function MessagesPage() {
  const { id: activeId } = useParams()
  const navigate = useNavigate()
  const { profile, members, memberById } = useTeam()
  const instanceId = useId()
  const { conversations, loading, error, openDirect, markRead, refresh } = useMessaging()

  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const active = conversations.find(c => c.id === activeId) || null

  const title = (c: typeof conversations[number]) =>
    c.kind === 'channel'
      ? c.name || 'Canal'
      : memberById(c.otherIds[0])?.full_name || 'Conversation'

  const fetchMessages = useCallback(async () => {
    if (!activeId) { setMessages([]); return }
    const { data, error: e } = await supabase
      .from('messages').select('*').eq('conversation_id', activeId).order('created_at')
    if (e) { setSendError('Impossible de charger les messages.'); return }
    setMessages((data || []) as Message[])
  }, [activeId])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  useEffect(() => {
    if (activeId) markRead(activeId)
  }, [activeId, messages.length, markRead])

  // Le fil se remplit tout seul quand l'autre écrit
  useEffect(() => {
    if (!activeId) return
    const channel = supabase
      .channel(`messages-${activeId}-${instanceId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        () => { fetchMessages() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeId, fetchMessages, instanceId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length > 0 ? 'smooth' : 'auto' })
  }, [messages])

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || !activeId || !profile) return
    setSending(true)
    setSendError(null)
    const { error: err } = await supabase.from('messages').insert({
      conversation_id: activeId, author_id: profile.id, body: text,
    })
    setSending(false)
    if (err) { setSendError("Le message n'est pas parti. Réessaie."); return }
    setBody('')
    fetchMessages()
    refresh()
  }

  const startDirect = async (otherId: string) => {
    const conv = await openDirect(otherId)
    if (conv) navigate(`/dashboard/messages/${conv}`)
  }

  // Membres avec qui aucune conversation n'est encore ouverte
  const others = members.filter(m => m.id !== profile?.id)
  const withoutConversation = others.filter(
    m => !conversations.some(c => c.kind === 'direct' && c.otherIds.includes(m.id))
  )

  return (
    <div className="p-4 sm:p-6 h-[calc(100vh-4rem)]">
      <ErrorBanner message={error || sendError} onDismiss={() => setSendError(null)} />

      <div className="flex gap-4 h-full">
        {/* Conversations */}
        <aside className={`w-full sm:w-72 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl overflow-y-auto ${activeId ? 'hidden sm:block' : ''}`}>
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">Messages</h2>
          </div>

          {loading ? (
            <p className="px-4 py-4 text-xs text-gray-500">Chargement…</p>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map(c => {
                const other = c.kind === 'direct' ? memberById(c.otherIds[0]) : undefined
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/dashboard/messages/${c.id}`)}
                    className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
                      c.id === activeId ? 'bg-blue-600/10' : 'hover:bg-gray-800'
                    }`}
                  >
                    {c.kind === 'channel' ? (
                      <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs font-semibold">
                        #
                      </span>
                    ) : (
                      <Avatar profile={other} size="md" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${c.unread > 0 ? 'text-white font-medium' : 'text-gray-300'}`}>
                        {title(c)}
                      </p>
                      {c.preview && (
                        <p className="text-[11px] text-gray-500 truncate">{c.preview}</p>
                      )}
                    </div>
                    {c.unread > 0 && (
                      <span className="px-1.5 min-w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </button>
                )
              })}

              {withoutConversation.length > 0 && (
                <div className="pt-3">
                  <p className="px-2.5 pb-1 text-[10px] uppercase tracking-wider text-gray-600">Démarrer</p>
                  {withoutConversation.map(m => (
                    <button
                      key={m.id}
                      onClick={() => startDirect(m.id)}
                      className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Avatar profile={m} size="md" />
                      <span className="text-sm text-gray-400 truncate">{m.full_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Fil */}
        <section className={`flex-1 min-w-0 bg-gray-900 border border-gray-800 rounded-xl flex flex-col ${activeId ? '' : 'hidden sm:flex'}`}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <p className="text-sm text-gray-500 text-center">
                Choisis une conversation à gauche, ou écris directement à quelqu'un de l'équipe.
              </p>
            </div>
          ) : (
            <>
              <header className="px-4 py-3 border-b border-gray-800 flex items-center gap-2.5">
                <button
                  onClick={() => navigate('/dashboard/messages')}
                  className="sm:hidden text-gray-400 hover:text-white"
                  aria-label="Retour aux conversations"
                >
                  ←
                </button>
                {active.kind === 'channel'
                  ? <span className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs">#</span>
                  : <Avatar profile={memberById(active.otherIds[0])} size="md" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{title(active)}</p>
                  <p className="text-[11px] text-gray-500">
                    {active.kind === 'channel'
                      ? `${active.otherIds.length + 1} membres`
                      : memberById(active.otherIds[0])?.job_title || 'Conversation directe'}
                  </p>
                </div>
              </header>

              <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-8">
                    Aucun message. Lance la conversation.
                  </p>
                )}
                {messages.map((m, i) => {
                  const author = memberById(m.author_id)
                  const mine = m.author_id === profile?.id
                  const prev = messages[i - 1]
                  const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at)
                  const grouped = prev && !newDay && prev.author_id === m.author_id
                  return (
                    <div key={m.id}>
                      {newDay && (
                        <p className="text-center text-[10px] uppercase tracking-wider text-gray-600 my-4">
                          {dayLabel(m.created_at)}
                        </p>
                      )}
                      <div className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 flex-shrink-0">
                          {!grouped && <Avatar profile={author} size="md" />}
                        </div>
                        <div className={`max-w-[75%] ${mine ? 'items-end' : ''} flex flex-col`}>
                          {!grouped && (
                            <p className={`text-[11px] text-gray-500 mb-0.5 ${mine ? 'text-right' : ''}`}>
                              {author?.full_name || 'Membre supprimé'} · {format(parseISO(m.created_at), 'HH:mm')}
                            </p>
                          )}
                          <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                            mine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                          }`}>
                            {m.body}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="p-3 border-t border-gray-800 flex items-end gap-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e) }
                  }}
                  rows={1}
                  placeholder="Écrire un message… (Entrée pour envoyer)"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none max-h-32"
                />
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                >
                  {sending ? '…' : 'Envoyer'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
