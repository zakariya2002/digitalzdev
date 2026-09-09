import { useEffect, useLayoutEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_IN_OUT } from './motion/config'
import { scrollTo } from '../lib/scroll'

interface Props {
  children: ReactNode
}

/**
 * Enveloppe d'une page de la vitrine.
 *
 * Monté sous une `AnimatePresence` en mode « wait », ce composant ne se monte
 * qu'une fois la page précédente sortie : c'est le bon moment pour remettre le
 * scroll en haut, sans que le saut soit visible pendant la transition.
 *
 * Le tout premier affichage échappe à l'animation. La page arrive déjà rendue
 * par le serveur : la faire apparaître en fondu reviendrait à masquer un
 * contenu déjà lisible, et surtout le serveur écrirait une opacité nulle que
 * le navigateur corrigerait aussitôt, ce qui casse l'hydratation. Les
 * transitions reprennent dès la première navigation interne.
 */
/** Vrai jusqu'à ce qu'une première page ait été montée dans le navigateur. */
let premierAffichage = true

export default function PageTransition({ children }: Props) {
  const reduced = useReducedMotion()
  const [sansAnimation] = useState(() => premierAffichage)

  useEffect(() => {
    premierAffichage = false
  }, [])

  useLayoutEffect(() => {
    scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
  }, [])

  if (reduced || sansAnimation) return <>{children}</>

  // Uniquement l'opacité : un `transform` sur cet élément en ferait le bloc
  // conteneur de toute la page et casserait les `position: sticky` des
  // sections épinglées (hero, galerie de projets).
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE_IN_OUT }}
    >
      {children}
    </motion.div>
  )
}
