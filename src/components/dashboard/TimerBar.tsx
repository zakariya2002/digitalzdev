import { useTimer } from '../../contexts/TimerContext'

function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

/** Barre flottante visible tant qu'un chronomètre tourne. */
export default function TimerBar() {
  const { running, taskTitle, elapsedSeconds, stop, error } = useTimer()

  if (!running) return null

  return (
    <div className="fixed bottom-4 left-4 lg:left-[17rem] z-40 flex items-center gap-3 px-4 py-2.5 bg-gray-900 border border-blue-600/50 rounded-xl shadow-2xl">
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-mono font-semibold text-white tabular-nums leading-tight">
          {formatElapsed(elapsedSeconds)}
        </p>
        <p className="text-[11px] text-gray-400 truncate max-w-[14rem]">{taskTitle || 'Tâche en cours'}</p>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
      <button
        onClick={() => stop()}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
      >
        Arrêter
      </button>
    </div>
  )
}
