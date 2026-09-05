import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Filet de progression en haut de page.
 *
 * `scaleX` plutôt que `width` : la transformation est composée par le GPU et
 * ne provoque aucun recalcul de mise en page à chaque frame.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-accent"
      style={{ scaleX }}
    />
  )
}
