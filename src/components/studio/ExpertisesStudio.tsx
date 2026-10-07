import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { METIERS } from '../ExpertisesSection'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Les trois métiers, en onglets.
 *
 * Trois grands noms à gauche ; celui qu'on choisit s'allume et son contenu
 * remplace le précédent à droite. Sur ordinateur le survol suffit, sur mobile
 * on touche.
 */
export default function ExpertisesStudio() {
  const [actif, setActif] = useState(0)
  const metier = METIERS[actif]

  return (
    <section id="expertises" className="bg-surface-light px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-text-muted">Expertises</p>
        <h2 className="mt-6 max-w-4xl text-[12vw] text-text-primary md:text-7xl lg:text-8xl">
          Trois métiers, <span className="text-accent">trois exigences.</span>
        </h2>

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-2 lg:col-span-5" role="tablist" aria-label="Métiers">
            {METIERS.map((m, i) => (
              <button
                key={m.cible}
                type="button"
                role="tab"
                aria-selected={actif === i}
                onClick={() => setActif(i)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActif(i)}
                className={`group flex items-center justify-between rounded-2xl px-5 py-5 text-left transition-colors duration-500 md:px-7 md:py-7 ${
                  actif === i ? 'bg-accent text-surface' : 'bg-surface-card text-text-primary hover:bg-surface-border'
                }`}
              >
                <span className="text-xl font-black tracking-tight md:text-3xl">{m.cible}</span>
                <motion.span
                  aria-hidden
                  animate={{ rotate: actif === i ? 0 : -45 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="text-2xl font-black"
                >
                  →
                </motion.span>
              </button>
            ))}
          </div>

          <div className="relative min-h-[26rem] lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={metier.cible}
                role="tabpanel"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h3 className="text-3xl font-black leading-tight tracking-tight text-text-primary md:text-5xl">
                  {metier.titre}
                </h3>
                <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-text-secondary">
                  {metier.texte}
                </p>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {metier.points.map((point, i) => (
                    <motion.li
                      key={point}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: EASE }}
                      className="flex items-start gap-3 rounded-2xl bg-surface-card px-5 py-4 text-[15px] font-semibold text-text-primary"
                    >
                      <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
