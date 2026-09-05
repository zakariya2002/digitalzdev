import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /**
   * Amplitude du décalage. Positif : l'élément traîne derrière le scroll.
   * Négatif : il le devance.
   */
  speed?: number
  axis?: 'y' | 'x'
  /** Léger zoom couplé au déplacement, pour les images de fond */
  zoom?: boolean
}

/**
 * Décalage parallaxe piloté par la position de l'élément dans le viewport.
 *
 * Le ressort évite la sensation de « collé au pixel » qu'a un mapping direct :
 * c'est ce retard d'un ou deux frames qui rend le mouvement organique.
 */
export default function Parallax({
  children,
  className,
  speed = 0.15,
  axis = 'y',
  zoom = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.0005,
  })

  const distance = speed * 100
  const offset = useTransform(smooth, [0, 1], [`${distance}%`, `${-distance}%`])
  const scale = useTransform(smooth, [0, 0.5, 1], [1.12, 1.02, 1.12])

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...(axis === 'y' ? { y: offset } : { x: offset }),
        ...(zoom ? { scale } : {}),
      }}
    >
      {children}
    </motion.div>
  )
}
