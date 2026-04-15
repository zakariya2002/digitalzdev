import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTwilio } from '../../contexts/TwilioContext'
import { supabase } from '../../lib/supabase'
import { toE164 } from '../../lib/phone'
import type { ClientStatus } from '../../types/database'

interface PostCallData {
  clientId: string
  clientName: string
  callNote: string
  newStatus: ClientStatus | ''
  followUpDate: string
  callSid: string | null
}

export default function Softphone() {
  const { status, callDuration, isMuted, makeCall, hangup, toggleMute, acceptIncoming, rejectIncoming, activeCall } = useTwilio()

  const [callNote, setCallNote] = useState('')
  const [showPostCall, setShowPostCall] = useState(false)
  const [postCallData, setPostCallData] = useState<PostCallData | null>(null)
  const [saving, setSaving] = useState(false)

  // Dialer state
  const [dialerOpen, setDialerOpen] = useState(false)
  const [dialNumber, setDialNumber] = useState('')

  // Formatage timer
  const minutes = Math.floor(callDuration / 60).toString().padStart(2, '0')
  const seconds = (callDuration % 60).toString().padStart(2, '0')

  const handleDial = () => {
    if (!dialNumber.trim()) return
    const e164 = toE164(dialNumber.trim())
    makeCall(e164)
    setDialerOpen(false)
  }

  const handleDialPad = (digit: string) => {
    setDialNumber(prev => prev + digit)
  }

  const handleBackspace = () => {
    setDialNumber(prev => prev.slice(0, -1))
  }

  const handleHangup = () => {
    const params = activeCall?.parameters || {}
    setPostCallData({
      clientId: (params as Record<string, string>).clientId || '',
      clientName: (params as Record<string, string>).clientName || 'Appel',
      callNote,
      newStatus: '',
      followUpDate: '',
      callSid: (params as Record<string, string>).CallSid || null,
    })
    hangup()
    setShowPostCall(true)
  }

  const handleSavePostCall = async () => {
    if (!postCallData) return
    setSaving(true)

    if (postCallData.callSid) {
      await supabase
        .from('calls')
        .update({ call_note: postCallData.callNote || null })
        .eq('twilio_call_sid', postCallData.callSid)
    }

    if (postCallData.clientId) {
      const updateData: Record<string, unknown> = {}
      if (postCallData.newStatus) updateData.status = postCallData.newStatus
      if (postCallData.followUpDate) updateData.next_follow_up_at = postCallData.followUpDate
      if (Object.keys(updateData).length > 0) {
        await supabase.from('clients').update(updateData).eq('id', postCallData.clientId)
      }
    }

    setSaving(false)
    setShowPostCall(false)
    setPostCallData(null)
    setCallNote('')
  }

  const handleIgnorePostCall = () => {
    setShowPostCall(false)
    setPostCallData(null)
    setCallNote('')
  }

  const dialPadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ]

  // Post-call modal
  if (showPostCall && postCallData) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4"
        >
          <h4 className="text-sm font-semibold text-white mb-3">Notes d'appel</h4>

          <textarea
            value={postCallData.callNote}
            onChange={(e) => setPostCallData({ ...postCallData, callNote: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none mb-3"
            placeholder="Notes de l'appel..."
          />

          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Mettre à jour le statut</label>
            <select
              value={postCallData.newStatus}
              onChange={(e) => setPostCallData({ ...postCallData, newStatus: e.target.value as ClientStatus | '' })}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Ne pas modifier</option>
              <option value="contacted">Contacté</option>
              <option value="qualified">Qualifié</option>
              <option value="active">Client actif</option>
              <option value="completed">Terminé</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">Prochaine relance</label>
            <input
              type="datetime-local"
              value={postCallData.followUpDate}
              onChange={(e) => setPostCallData({ ...postCallData, followUpDate: e.target.value })}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSavePostCall}
              disabled={saving}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
            <button
              onClick={handleIgnorePostCall}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Ignorer
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {/* IDLE — Bouton rond cliquable + Dialer */}
        {status === 'idle' && !dialerOpen && (
          <motion.button
            key="idle"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setDialerOpen(true)}
            className="w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors"
            title="Composer un numéro"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </motion.button>
        )}

        {/* DIALER — Pavé numérique */}
        {status === 'idle' && dialerOpen && (
          <motion.div
            key="dialer"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-72 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Composer</h4>
              <button
                onClick={() => { setDialerOpen(false); setDialNumber('') }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Number display */}
            <div className="relative mb-3">
              <input
                type="tel"
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDial() }}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-3 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-center text-lg font-mono tracking-wider placeholder-gray-600 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {dialNumber && (
                <button
                  onClick={handleBackspace}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.374-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Dial pad */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {dialPadKeys.map((row) =>
                row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleDialPad(key)}
                    className="py-3 bg-gray-700 hover:bg-gray-600 text-white text-lg font-medium rounded-xl transition-colors active:bg-gray-500"
                  >
                    {key}
                  </button>
                ))
              )}
            </div>

            {/* Call button */}
            <button
              onClick={handleDial}
              disabled={!dialNumber.trim()}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Appeler
            </button>
          </motion.div>
        )}

        {/* LOADING */}
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center shadow-lg"
          >
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-14 h-14 bg-red-600/20 border border-red-500/30 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            title="Erreur Twilio — cliquer pour réessayer"
            onClick={() => window.location.reload()}
          >
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </motion.div>
        )}

        {/* CALLING */}
        {status === 'calling' && (
          <motion.div
            key="calling"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-72 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Appel en cours...</p>
                <p className="text-xs text-gray-400">Connexion</p>
              </div>
            </div>
            <button
              onClick={handleHangup}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 8.464a5 5 0 000 7.072M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Raccrocher
            </button>
          </motion.div>
        )}

        {/* IN-CALL */}
        {status === 'in-call' && (
          <motion.div
            key="in-call"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">En appel</p>
                  <p className="text-lg font-mono text-green-400">{minutes}:{seconds}</p>
                </div>
              </div>
            </div>

            <textarea
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 mb-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Notes d'appel..."
            />

            <div className="flex gap-2">
              <button
                onClick={toggleMute}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  isMuted
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {isMuted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 19L17.591 17.591L5.409 5.409L4 4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75C8.27 18.75 5.25 15.73 5.25 12V10.5M12 18.75V22.5M8.25 22.5h7.5M18.75 10.5v1.5M12 1.5a3 3 0 00-3 3v6" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                )}
                {isMuted ? 'Muté' : 'Mute'}
              </button>
              <button
                onClick={handleHangup}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 8.464a5 5 0 000 7.072M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Raccrocher
              </button>
            </div>
          </motion.div>
        )}

        {/* INCOMING */}
        {status === 'incoming' && (
          <motion.div
            key="incoming"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-72 bg-gray-800 border-2 border-green-500/50 rounded-2xl shadow-2xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Appel entrant</p>
                <p className="text-xs text-gray-400">
                  {activeCall?.parameters ? (activeCall.parameters as Record<string, string>).From || 'Inconnu' : 'Inconnu'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={acceptIncoming}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Accepter
              </button>
              <button
                onClick={rejectIncoming}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Rejeter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
