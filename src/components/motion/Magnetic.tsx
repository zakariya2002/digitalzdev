import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** Part du déplacement du curseur reprise par l'élément */
  strength?: number
}

/**
 * Attire l'élément vers le curseur quand celui-ci le survole.
 *
 * Réservé au pointeur fin : sur écran tactile il n'y a pas de survol, et le
 * ressort ne ferait qu'ajouter du travail au compositeur.
 */
export default function Magnetic({ children, className, strength = 0.35 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 })

  const handleMove = (event: React.MouseEvent) => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  )
}
