import { useState, useEffect } from 'react'
import { useTimeClock, formatHours } from '../../hooks/useTimeClock'
import { useTeam } from '../../contexts/TeamContext'

/** Bouton de pointage, toujours à portée : arrivée, départ, et temps du jour. */
export default function PunchButton() {
  const { profile } = useTeam()
  const { openSession, workDays, punch, error } = useTimeClock(7)
  const [elapsed, setElapsed] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!openSession) { setElapsed(0); return }
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(openSession.started_at).getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [openSession])

  if (!profile) return null

  const today = new Date().toISOString().slice(0, 10)
  const todayHours = workDays
    .filter(d => d.profile_id === profile.id && d.day === today)
    .reduce((sum, d) => sum + Number(d.hours), 0)

  const running = !!openSession
  const clock = `${String(Math.floor(elapsed / 3600)).padStart(2, '0')}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}`

  return (
    <button
      onClick={async () => { setBusy(true); await punch(); setBusy(false) }}
      disabled={busy}
      title={running ? 'Badger le départ' : "Badger l'arrivée"}
      className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
        running
          ? 'bg-green-600/15 text-green-400 hover:bg-green-600/25'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {running ? (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span className="tabular-nums">{running ? clock : formatHours(todayHours)}</span>
      <span className="hidden sm:inline">{running ? 'Départ' : 'Badger'}</span>
      {error && <span className="sr-only">{error}</span>}
    </button>
  )
}
