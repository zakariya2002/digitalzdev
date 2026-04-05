import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTwilio } from '../../contexts/TwilioContext'
import { formatPhone } from '../../lib/phone'
import type { Call, CallStatus } from '../../types/database'

interface CallHistoryProps {
  clientId: string
  clientPhone?: string | null
}

const STATUS_BADGE: Record<CallStatus, { label: string; color: string }> = {
  initiated: { label: 'Initié', color: 'bg-gray-500/20 text-gray-400' },
  ringing: { label: 'Sonnerie', color: 'bg-blue-500/20 text-blue-400' },
  in_progress: { label: 'En cours', color: 'bg-green-500/20 text-green-400' },
  completed: { label: 'Terminé', color: 'bg-green-500/20 text-green-400' },
  no_answer: { label: 'Pas de réponse', color: 'bg-amber-500/20 text-amber-400' },
  busy: { label: 'Occupé', color: 'bg-amber-500/20 text-amber-400' },
  failed: { label: 'Échoué', color: 'bg-red-500/20 text-red-400' },
  canceled: { label: 'Annulé', color: 'bg-gray-500/20 text-gray-400' },
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'Non décroché'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}min ${s}s`
  return `${s}s`
}

export default function CallHistory({ clientId, clientPhone }: CallHistoryProps) {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { makeCall } = useTwilio()

  useEffect(() => {
    supabase
      .from('calls')
      .select('*')
      .eq('client_id', clientId)
      .order('called_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Fetch calls error:', error)
        if (data) setCalls(data as Call[])
        setLoading(false)
      })
  }, [clientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Aucun appel enregistré</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {calls.map((call) => {
        const badge = STATUS_BADGE[call.status]
        const isExpanded = expandedId === call.id
        const isMissed = call.status === 'no_answer' || call.status === 'failed'

        return (
          <div key={call.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg">
            <button
              onClick={() => setExpandedId(isExpanded ? null : call.id)}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-800 transition-colors rounded-lg"
            >
              {/* Direction icon */}
              <span className="text-lg">
                {call.direction === 'outbound' ? (
                  isMissed ? (
                    <span className="text-red-400" title="Sortant manqué">&#8599;</span>
                  ) : (
                    <span className="text-green-400" title="Sortant">&#8599;</span>
                  )
                ) : (
                  <span className="text-blue-400" title="Entrant">&#8601;</span>
                )}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{formatDuration(call.duration)}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(call.called_at), { addSuffix: true, locale: fr })}
                </p>
              </div>

              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>
                {badge.label}
              </span>

              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 pt-1 border-t border-gray-700/50 space-y-2">
                {call.call_note && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                    <p className="text-sm text-gray-300">{call.call_note}</p>
                  </div>
                )}
                {call.recording_url && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Enregistrement</p>
                    <audio controls className="w-full h-8" src={call.recording_url}>
                      <track kind="captions" />
                    </audio>
                  </div>
                )}
                {clientPhone && (
                  <button
                    onClick={() => makeCall(clientPhone)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-400 text-xs font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Rappeler ({formatPhone(clientPhone)})
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
