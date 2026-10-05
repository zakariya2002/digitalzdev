import { useEffect, useRef, useState } from 'react'

/**
 * Vidéo de présentation du haut de page.
 *
 * Elle démarre seule, sans le son : les navigateurs n'autorisent la lecture
 * automatique qu'en muet. Un bouton rend le son. Elle se met en pause hors de
 * l'écran pour ménager la batterie, et ne démarre pas seule quand l'appareil
 * demande de limiter les animations.
 */
export default function HeroVideo({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [son, setSon] = useState(false)
  const [enLecture, setEnLecture] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const sobre = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (sobre) return

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 }
    )
    observateur.observe(video)
    return () => observateur.disconnect()
  }, [])

  const basculerSon = () => {
    const video = ref.current
    if (!video) return
    video.muted = !video.muted
    setSon(!video.muted)
    if (video.paused) void video.play().catch(() => {})
  }

  const basculerLecture = () => {
    const video = ref.current
    if (!video) return
    if (video.paused) void video.play().catch(() => {})
    else video.pause()
  }

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-[1.75rem] bg-surface-card shadow-[0_30px_80px_-24px_rgba(0,0,0,0.45)] ${className}`}
    >
      <video
        ref={ref}
        className="h-full w-full cursor-pointer object-cover"
        src="/videos/presentation.mp4"
        poster="/videos/presentation-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        onClick={basculerLecture}
        onPlay={() => setEnLecture(true)}
        onPause={() => setEnLecture(false)}
        aria-label="Vidéo de présentation de Digitalz Dev"
      />

      {!enLecture && (
        <button
          type="button"
          onClick={basculerLecture}
          aria-label="Lire la vidéo"
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-surface shadow-lg transition-transform hover:scale-105"
        >
          <svg className="ml-1 h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 4.5v15l13-7.5-13-7.5z" />
          </svg>
        </button>
      )}

      <button
        type="button"
        onClick={basculerSon}
        aria-label={son ? 'Couper le son' : 'Activer le son'}
        className="absolute bottom-3 right-3 inline-flex min-h-[40px] items-center gap-2 rounded-full bg-accent px-4 font-display text-xs font-extrabold uppercase tracking-tight text-surface shadow-md transition-colors hover:bg-accent-hover sm:bottom-4 sm:right-4"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" />
          {son ? (
            <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
          ) : (
            <path d="M16 9l5 6M21 9l-5 6" />
          )}
        </svg>
        {son ? 'Son' : 'Son coupé'}
      </button>
    </div>
  )
}
