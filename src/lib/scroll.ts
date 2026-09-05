import Lenis from 'lenis'

/**
 * État de scroll partagé.
 *
 * Les scènes WebGL le lisent à chaque frame plutôt que de passer par un state
 * React : un re-render par frame coûterait bien plus cher que le rendu lui-même.
 */
export const scrollState = {
  /** Position de scroll en pixels */
  y: 0,
  /** Vitesse brute renvoyée par Lenis (px/frame) */
  velocity: 0,
  /** Vitesse normalisée et lissée, dans [-1, 1] environ */
  smoothVelocity: 0,
  /** Progression dans la page, dans [0, 1] */
  progress: 0,
}

let lenis: Lenis | null = null

export const getLenis = () => lenis

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Le smooth scroll reste desktop : sur mobile l'inertie native est meilleure. */
const isTouch = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 1024px)').matches || 'ontouchstart' in window)

/**
 * Démarre le scroll lissé et alimente `scrollState`.
 * Renvoie la fonction de nettoyage.
 */
export function initSmoothScroll(): () => void {
  const maxScroll = () =>
    Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

  // Sur mobile et en reduced-motion, on se contente d'écouter le scroll natif.
  if (isTouch() || prefersReducedMotion()) {
    let last = window.scrollY
    let raf = 0

    const tick = () => {
      const y = window.scrollY
      const v = y - last
      last = y
      scrollState.y = y
      scrollState.velocity = v
      scrollState.smoothVelocity +=
        (clamp(v / 60, -1, 1) - scrollState.smoothVelocity) * 0.1
      scrollState.progress = y / maxScroll()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }

  const instance = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  })
  lenis = instance
  ;(window as unknown as Record<string, unknown>).__lenis = instance

  instance.on('scroll', ({ scroll, velocity }: { scroll: number; velocity: number }) => {
    scrollState.y = scroll
    scrollState.velocity = velocity
    scrollState.progress = scroll / maxScroll()
  })

  let raf = 0
  const tick = (time: number) => {
    instance.raf(time)
    // Lissage exponentiel : évite les à-coups quand la molette s'arrête net.
    scrollState.smoothVelocity +=
      (clamp(scrollState.velocity / 60, -1, 1) - scrollState.smoothVelocity) * 0.08
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    instance.destroy()
    lenis = null
    ;(window as unknown as Record<string, unknown>).__lenis = null
  }
}

/** Défilement programmé, qui passe par Lenis quand il est actif. */
export function scrollTo(
  target: number | string | HTMLElement,
  options: { offset?: number; immediate?: boolean; duration?: number } = {}
) {
  if (lenis) {
    lenis.scrollTo(target as never, options)
    return
  }
  const el =
    typeof target === 'string' ? document.querySelector(target) : target
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: options.immediate ? 'auto' : 'smooth' })
  } else if (el instanceof HTMLElement) {
    const top = el.getBoundingClientRect().top + window.scrollY + (options.offset ?? 0)
    window.scrollTo({ top, behavior: options.immediate ? 'auto' : 'smooth' })
  }
}

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Ramène `value` de l'intervalle [inMin, inMax] vers [outMin, outMax]. */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
