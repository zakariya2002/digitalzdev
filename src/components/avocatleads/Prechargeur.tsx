import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pictogramme } from './Logo'

const CLE = 'avocatleads-prechargeur-vu'
const DUREE_MS = 1100
const EASE = [0.76, 0, 0.24, 1] as const

/**
 * Rideau d'ouverture, une seule fois par visite.
 *
 * Un compteur file de 0 à 100 en un peu plus d'une seconde, puis le rideau
 * se lève sur le haut de page. Court à dessein : au-delà, un préchargeur
 * devient une attente. Absent si l'appareil demande moins d'animations.
 */
export default function Prechargeur() {
  const [visible, setVisible] = useState(false)
  const [compte, setCompte] = useState(0)

  useEffect(() => {
    let dejaVu = false
    try {
      dejaVu = sessionStorage.getItem(CLE) === '1'
    } catch {
      /* stockage refusé : on l'affiche */
    }
    const sobre = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (dejaVu || sobre) return

    setVisible(true)
    const debut = performance.now()
    let frame = 0
    let sortie = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - debut) / DUREE_MS)
      // Démarrage vif, fin ralentie : le compteur « se pose » sur 100.
      setCompte(Math.round((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) frame = requestAnimationFrame(tick)
      else {
        // Noté seulement une fois le compteur arrivé au bout : un effet
        // interrompu (rechargement, double montage en développement) doit
        // pouvoir rejouer l'ouverture plutôt que rester figé.
        try {
          sessionStorage.setItem(CLE, '1')
        } catch {
          /* voir plus haut */
        }
        sortie = window.setTimeout(() => setVisible(false), 180)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(sortie)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col justify-between bg-pop p-6 text-white md:p-10"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="flex items-center gap-3">
            <Pictogramme className="h-10 w-10" />
            <span className="text-xl tracking-[-0.03em]" style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
              <span className="font-light">avocat</span>
              <span className="font-bold">leads</span>
            </span>
          </div>
          <div className="flex items-end justify-between gap-6">
            <p className="max-w-[14rem] text-sm font-medium leading-snug">
              Sites internet pour avocats et cabinets d'avocats.
            </p>
            <span className="text-[15vw] font-normal leading-[0.8] tracking-[-0.05em] md:text-[11vw]" style={{ opacity: compte / 100 }}>
              Maître.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
