import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Curseur personnalisé, sur ordinateur uniquement.
 *
 * Un point citron qui suit la souris avec un léger retard. Au survol d'un
 * élément portant `data-curseur="Libellé"`, il s'agrandit en pastille et
 * affiche le libellé, comme « Voir » sur un projet. Sur écran tactile, ou si
 * l'appareil demande moins d'animations, rien n'est affiché.
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
    document.documentElement.classList.add('curseur-actif')

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
      document.documentElement.classList.remove('curseur-actif')
      window.removeEventListener('pointermove', bouger)
      window.removeEventListener('pointerdown', bas)
      window.removeEventListener('pointerup', haut)
    }
  }, [x, y])

  if (!actif) return null

  const taille = libelle ? 96 : 14
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full bg-accent font-sans text-[13px] font-medium text-surface"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: taille, height: taille, scale: enfonce ? 0.85 : 1 }}
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
