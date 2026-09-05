import type { Transition } from 'framer-motion'

/**
 * Vocabulaire d'animation commun à tout le site vitrine.
 *
 * Un seul jeu de courbes et de durées : c'est ce qui fait qu'un site paraît
 * réglé plutôt qu'assemblé.
 */

/** Expo out — la courbe de référence, pour les entrées de contenu. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

/** Plus sec, pour les micro-interactions (survol, bascule). */
export const EASE_SNAP = [0.4, 0, 0.2, 1] as const

/** Symétrique, pour ce qui entre et sort (overlays, transitions de page). */
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const

export const DURATION = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
  reveal: 1.4,
} as const

/** Ressort utilisé par les éléments qui suivent le curseur. */
export const SPRING: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
  mass: 0.6,
}

/** Marge de déclenchement : le contenu s'anime un peu avant d'être à l'écran. */
export const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' } as const
