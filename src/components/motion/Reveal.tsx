import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE_OUT, VIEWPORT } from './config'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface Props {
  children: ReactNode
  className?: string
  /** Décalage avant démarrage, en secondes */
  delay?: number
  duration?: number
  /** Sens d'arrivée du contenu */
  from?: Direction
  /** Amplitude du déplacement, en pixels */
  distance?: number
  /** Ajoute une mise au point progressive, à réserver aux blocs isolés */
  blur?: boolean
  scale?: boolean
  once?: boolean
}

const offsetFor = (from: Direction, distance: number) => {
  switch (from) {
    case 'up':
      return { y: distance }
    case 'down':
      return { y: -distance }
    case 'left':
      return { x: -distance }
    case 'right':
      return { x: distance }
    default:
      return {}
  }
}

/**
 * Apparition au scroll. Brique de base : tout ce qui entre dans le viewport
 * passe par ici, ce qui garantit une cadence identique d'une section à l'autre.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  duration = DURATION.base,
  from = 'up',
  distance = 40,
  blur = false,
  scale = false,
  once = true,
}: Props) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...offsetFor(from, distance),
        ...(scale ? { scale: 0.94 } : {}),
        ...(blur ? { filter: 'blur(10px)' } : {}),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        ...(scale ? { scale: 1 } : {}),
        ...(blur ? { filter: 'blur(0px)' } : {}),
      }}
      viewport={{ ...VIEWPORT, once }}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
