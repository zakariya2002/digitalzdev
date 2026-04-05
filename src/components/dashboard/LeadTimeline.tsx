import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import type { Call, Sms, TimelineEvent } from '../../types/database'

interface LeadTimelineProps {
  clientId: string
}

export default function LeadTimeline({ clientId }: LeadTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTimeline() {
      const [{ data: calls }, { data: smsMessages }] = await Promise.all([
        supabase.from('calls').select('*').eq('client_id', clientId),
        supabase.from('sms').select('*').eq('client_id', clientId),
      ])

      const timeline: TimelineEvent[] = []

      if (calls) {
        for (const call of calls as Call[]) {
          const isMissed = call.status === 'no_answer' || call.status === 'failed'
          const duration = call.duration
            ? `${Math.floor(call.duration / 60)}min ${call.duration % 60}s`
            : ''

          timeline.push({
            type: 'call',
            id: call.id,
            timestamp: call.called_at,
            summary: call.direction === 'outbound'
              ? isMissed
                ? 'Appel sortant — Pas de réponse'
                : `Appel sortant — ${duration}`
              : `Appel entrant — ${duration || 'Manqué'}`,
            data: call,
          })
        }
      }

      if (smsMessages) {
        for (const sms of smsMessages as Sms[]) {
          const preview = sms.body.length > 60 ? sms.body.slice(0, 60) + '...' : sms.body
          timeline.push({
            type: 'sms',
            id: sms.id,
            timestamp: sms.sent_at,
            summary: sms.direction === 'outbound'
              ? `SMS envoyé — ${preview}`
              : `SMS reçu — ${preview}`,
            data: sms,
          })
        }
      }

      // Tri par date DESC
      timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setEvents(timeline)
      setLoading(false)
    }

    fetchTimeline()
  }, [clientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Aucune interaction enregistrée</p>
      </div>
    )
  }

  return (
    <div className="relative pl-6">
      {/* Ligne verticale */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px border-l-2 border-dashed border-gray-700" />

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative flex items-start gap-3">
            {/* Point */}
            <div
              className={`absolute left-[-17px] top-1.5 w-3 h-3 rounded-full border-2 ${
                event.type === 'call'
                  ? 'bg-green-500 border-green-400'
                  : 'bg-blue-500 border-blue-400'
              }`}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {event.type === 'call' ? (
                  <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                )}
                <p className="text-sm text-gray-200">{event.summary}</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
