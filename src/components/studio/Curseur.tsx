import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Pastille de survol, sur ordinateur uniquement.
 *
 * Le pointeur reste celui du système. Au survol d'un élément portant
 * `data-curseur="Libellé"`, une petite pastille gris acier apparaît près du
 * pointeur avec le libellé, comme « Voir » sur un projet. Sur écran tactile,
 * ou si l'appareil demande moins d'animations, rien n'est affiché.
 */
export default function Curseur() {
  const [actif, setActif] = useState(false)
  const [libelle, setLibelle] = useState<string | null>(null)
  const [enfonce, setEnfonce] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 })

  useEffect(() => {
    const fin = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const sobre = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fin || sobre) return
    setActif(true)

    const bouger = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const cible = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-curseur]')
      setLibelle(cible?.dataset.curseur ?? null)
    }
    const bas = () => setEnfonce(true)
    const haut = () => setEnfonce(false)
    window.addEventListener('pointermove', bouger)
    window.addEventListener('pointerdown', bas)
    window.addEventListener('pointerup', haut)
    return () => {
      window.removeEventListener('pointermove', bouger)
      window.removeEventListener('pointerdown', bas)
      window.removeEventListener('pointerup', haut)
    }
  }, [x, y])

  if (!actif) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full bg-accent font-sans text-[11px] font-medium text-surface"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{
        width: libelle ? 56 : 0,
        height: libelle ? 56 : 0,
        opacity: libelle ? 1 : 0,
        scale: enfonce ? 0.85 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {libelle ? (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {libelle}
        </motion.span>
      ) : null}
    </motion.div>
  )
}
