import { useState, useMemo } from 'react'
import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTeam } from '../../contexts/TeamContext'
import { useTimeClock, formatHours } from '../../hooks/useTimeClock'
import Avatar from '../../components/dashboard/Avatar'
import ErrorBanner from '../../components/dashboard/ErrorBanner'

export default function TimeClockPage() {
  const { profile, members, memberById } = useTeam()
  const { sessions, workDays, openSession, loading, error, punch, addManual, removeSession } = useTimeClock(60)
  const [weekOffset, setWeekOffset] = useState(0)
  const [busy, setBusy] = useState(false)
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [manualStart, setManualStart] = useState('09:00')
  const [manualEnd, setManualEnd] = useState('17:00')
  const [manualNote, setManualNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const weekStart = useMemo(() => {
    const base = addDays(new Date(), weekOffset * 7)
    return startOfWeek(base, { weekStartsOn: 1 })
  }, [weekOffset])

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const hoursFor = (profileId: string, day: Date) =>
    workDays
      .filter(d => d.profile_id === profileId && isSameDay(parseISO(d.day), day))
      .reduce((sum, d) => sum + Number(d.hours), 0)

  const activeMembers = members.filter(m => m.is_active)
  const maxHours = Math.max(
    8,
    ...activeMembers.flatMap(m => weekDays.map(d => hoursFor(m.id, d)))
  )

  const mySessions = sessions.filter(s => s.profile_id === profile?.id).slice(0, 40)

  const submitManual = async () => {
    setFormError(null)
    const start = new Date(`${manualDate}T${manualStart}`)
    const end = new Date(`${manualDate}T${manualEnd}`)
    if (end <= start) { setFormError("L'heure de fin doit suivre l'heure de début."); return }
    setBusy(true)
    const ok = await addManual(start.toISOString(), end.toISOString(), manualNote || undefined)
    setBusy(false)
    if (ok) { setManualNote('') }
  }

  const inputClass = 'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500'

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <ErrorBanner message={error || formError} onDismiss={() => setFormError(null)} />

      {/* Badger */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar profile={profile} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">
              {openSession ? 'Journée en cours' : 'Pas de pointage en cours'}
            </p>
            <p className="text-xs text-gray-500">
              {openSession
                ? `Arrivée à ${format(parseISO(openSession.started_at), 'HH:mm')}`
                : "Badge ton arrivée pour compter ta journée"}
              {' · '}
              {formatHours(hoursFor(profile?.id || '', new Date()))} aujourd'hui
            </p>
          </div>
        </div>
        <button
          onClick={async () => { setBusy(true); await punch(); setBusy(false) }}
          disabled={busy}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            openSession ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {openSession ? 'Badger le départ' : "Badger l'arrivée"}
        </button>
      </div>

      {/* Semaine de l'équipe */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="text-sm font-semibold text-white">
            Semaine du {format(weekStart, 'd MMMM', { locale: fr })}
          </h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(w => w - 1)}
                    className="px-2.5 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">←</button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)}
                      className="px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">Cette semaine</button>
            )}
            <button onClick={() => setWeekOffset(w => w + 1)} disabled={weekOffset >= 0}
                    className="px-2.5 py-1 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 rounded-lg transition-colors">→</button>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-gray-500">Chargement…</p>
        ) : (
          <div className="space-y-5">
            {activeMembers.map(member => {
              const total = weekDays.reduce((sum, d) => sum + hoursFor(member.id, d), 0)
              return (
                <div key={member.id}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar profile={member} size="sm" />
                      <span className="text-sm text-white">{member.full_name}</span>
                    </div>
                    <span className="text-sm text-gray-400 tabular-nums">{formatHours(total)} cette semaine</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDays.map(day => {
                      const h = hoursFor(member.id, day)
                      const isToday = isSameDay(day, new Date())
                      const height = Math.max(4, Math.round((h / maxHours) * 56))
                      return (
                        <div key={day.toISOString()} className="flex flex-col items-center gap-1">
                          <div className="h-14 w-full flex items-end">
                            <div
                              className={`w-full rounded transition-all ${h > 0 ? '' : 'bg-gray-800'}`}
                              style={{ height: `${height}px`, backgroundColor: h > 0 ? member.color : undefined }}
                              title={`${format(day, 'EEEE d', { locale: fr })} — ${formatHours(h)}`}
                            />
                          </div>
                          <span className={`text-[10px] ${isToday ? 'text-white font-medium' : 'text-gray-600'}`}>
                            {format(day, 'EEEEE', { locale: fr })}
                          </span>
                          <span className="text-[10px] text-gray-500 tabular-nums">
                            {h > 0 ? h.toFixed(1) : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Saisie oubliée */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Ajouter une journée oubliée</h3>
        <p className="text-xs text-gray-500 mb-3">
          Quand on oublie de badger. La saisie est marquée comme manuelle.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className={inputClass} />
          <input type="time" value={manualStart} onChange={(e) => setManualStart(e.target.value)} className={inputClass} />
          <input type="time" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} className={inputClass} />
          <input type="text" value={manualNote} onChange={(e) => setManualNote(e.target.value)}
                 placeholder="Note (optionnel)" className={`${inputClass} flex-1 min-w-[10rem]`} />
          <button onClick={submitManual} disabled={busy}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200 text-sm rounded-lg transition-colors">
            Ajouter
          </button>
        </div>
      </div>

      {/* Mes pointages */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Mes pointages</h3>
        {mySessions.length === 0 ? (
          <p className="text-xs text-gray-500">Aucun pointage pour l'instant.</p>
        ) : (
          <div className="space-y-1.5">
            {mySessions.map(session => {
              const start = parseISO(session.started_at)
              const end = session.ended_at ? parseISO(session.ended_at) : null
              const hours = ((end ?? new Date()).getTime() - start.getTime()) / 3600000
              return (
                <div key={session.id} className="flex items-center gap-3 px-3 py-2 bg-gray-800/60 rounded-lg group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">
                      {format(start, 'EEEE d MMMM', { locale: fr })}
                      <span className="text-gray-500 font-normal">
                        {' · '}{format(start, 'HH:mm')} → {end ? format(end, 'HH:mm') : 'en cours'}
                      </span>
                    </p>
                    {(session.note || session.is_manual) && (
                      <p className="text-[11px] text-gray-500">
                        {session.is_manual && 'Saisie manuelle'}
                        {session.is_manual && session.note && ' · '}
                        {session.note}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-300 tabular-nums flex-shrink-0">{formatHours(hours)}</span>
                  <button onClick={() => removeSession(session.id)}
                          className="text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    Retirer
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
