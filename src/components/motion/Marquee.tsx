import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { scrollState } from '../../lib/scroll'

interface Props {
  items: string[]
  className?: string
  /** Vitesse de croisière, en pixels par seconde */
  speed?: number
  direction?: 1 | -1
  separator?: string
}

/**
 * Bandeau défilant dont la vitesse — et le sens — suivent le scroll.
 *
 * L'animation est écrite à la main plutôt qu'en CSS : c'est le couplage à la
 * vitesse de scroll qui donne l'effet, et une keyframe CSS ne sait pas le faire.
 */
export default function Marquee({
  items,
  className = '',
  speed = 40,
  direction = 1,
  separator = '✦',
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    if (!track) return

    let offset = 0
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now

      // La vitesse de scroll s'ajoute à la vitesse de croisière et peut
      // inverser le sens du défilement quand on remonte vite.
      const boost = scrollState.smoothVelocity * 340
      offset += (speed * direction + boost) * delta

      // La piste contient deux copies de la liste : on boucle sur la moitié.
      const half = track.scrollWidth / 2
      if (half > 0) offset = ((offset % half) + half) % half

      track.style.transform = `translate3d(${-offset}px, 0, 0)`
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [speed, direction, reduced])

  const sequence = [...items, ...items]

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div ref={trackRef} className="flex w-max items-center will-change-transform">
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center whitespace-nowrap">
            {item}
            <span className="mx-6 md:mx-10 text-accent opacity-60">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
