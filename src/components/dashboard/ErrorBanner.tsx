interface ErrorBannerProps {
  message: string | null
  onDismiss?: () => void
}

/** Rend visible un échec d'écriture au lieu de le laisser dans la console. */
export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null
  return (
    <div className="mb-4 flex items-start justify-between gap-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
      <p className="text-sm text-red-400">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-xs text-red-400 hover:text-red-300 flex-shrink-0">
          Fermer
        </button>
      )}
    </div>
  )
}
