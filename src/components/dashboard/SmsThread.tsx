import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import type { Sms } from '../../types/database'

interface SmsThreadProps {
  clientId: string
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'delivered') return <span className="text-green-400 text-xs" title="Délivré">&#10003;&#10003;</span>
  if (status === 'sent') return <span className="text-gray-400 text-xs" title="Envoyé">&#10003;</span>
  if (status === 'failed') return <span className="text-red-400 text-xs" title="Échoué">&#10007;</span>
  if (status === 'queued') return <span className="text-gray-500 text-xs" title="En attente">&#8987;</span>
  return null
}

export default function SmsThread({ clientId }: SmsThreadProps) {
  const [messages, setMessages] = useState<Sms[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('sms')
      .select('*')
      .eq('client_id', clientId)
      .order('sent_at', { ascending: true })

    if (error) console.error('Fetch SMS error:', error)
    if (data) setMessages(data as Sms[])
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
    // Refresh toutes les 30 secondes
    const interval = setInterval(fetchMessages, 30000)
    return () => clearInterval(interval)
  }, [clientId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Aucun SMS échangé</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {messages.map((msg) => {
        const isOutbound = msg.direction === 'outbound'
        return (
          <div
            key={msg.id}
            className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-xl ${
                isOutbound
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-700 text-gray-200 rounded-bl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
              <div className={`flex items-center gap-1.5 mt-1 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[10px] opacity-60">
                  {formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true, locale: fr })}
                </span>
                {isOutbound && <StatusIcon status={msg.status} />}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
