import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const QUIZ_PRODUCTION = 'https://quiz.digitalzdev.com'
const QUIZ_PREVISUALISATION =
  'https://digitalzdev-quiz-git-punchy-zakariya2002s-projects.vercel.app/quiz'

/**
 * Sur digitalzdev.com, la fenêtre mène au quiz en ligne ; partout ailleurs
 * (local, prévisualisations), au quiz de la branche d'essai, pour qu'on juge
 * les deux dans le même style.
 */
function urlQuiz(): string {
  if (typeof window === 'undefined') return QUIZ_PRODUCTION
  return /(^|\.)digitalzdev\.com$/.test(window.location.hostname)
    ? QUIZ_PRODUCTION
    : QUIZ_PREVISUALISATION
}
const CLE = 'digitalz-accueil-vu'
const EASE = [0.32, 0.72, 0, 1] as const

/**
 * Fenêtre d'accueil : l'aperçu gratuit, proposé dès l'arrivée.
 *
 * Une seule fois par visite : elle est mémorisée dans le stockage de l'onglet,
 * et ne revient ni au rechargement ni en revenant sur l'accueil. Elle se
 * referme par la croix, « Plus tard », un clic sur le voile ou Échap.
 */
export default function AccueilPopup() {
  const [ouverte, setOuverte] = useState(false)

  useEffect(() => {
    let dejaVue = false
    try {
      dejaVue = sessionStorage.getItem(CLE) === '1'
    } catch {
      /* stockage refusé : on l'affiche, sans pouvoir s'en souvenir */
    }
    if (dejaVue) return
    // Un court délai laisse le haut de page s'afficher avant la fenêtre.
    const t = window.setTimeout(() => setOuverte(true), 1400)
    return () => window.clearTimeout(t)
  }, [])

  const fermer = () => {
    setOuverte(false)
    try {
      sessionStorage.setItem(CLE, '1')
    } catch {
      /* voir plus haut */
    }
  }

  useEffect(() => {
    if (!ouverte) return
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer()
    }
    window.addEventListener('keydown', auClavier)
    return () => window.removeEventListener('keydown', auClavier)
  }, [ouverte])

  return (
    <AnimatePresence>
      {ouverte && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={fermer}
            className="absolute inset-0 cursor-default bg-[rgb(10_18_70/0.55)] backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="accueil-titre"
            className="relative w-full max-w-xl overflow-hidden rounded-[2rem] bg-surface px-7 pb-7 pt-12 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:px-12 sm:pb-10 sm:pt-14"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <button
              type="button"
              onClick={fermer}
              aria-label="Fermer"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-text-primary transition-colors hover:bg-accent hover:text-surface"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>

            <h2
              id="accueil-titre"
              className="text-[2.6rem] leading-[0.98] sm:text-6xl"
            >
              <motion.span
                className="block text-text-primary"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
              >
                Votre site à votre image.
              </motion.span>
              <motion.span
                className="mt-1 block text-accent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28, ease: EASE }}
              >
                Un aperçu en 60 secondes.
              </motion.span>
            </h2>

            <motion.p
              className="mx-auto mt-5 max-w-sm text-base text-text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.42 }}
            >
              Répondez à quelques questions, nous générons une démo de votre
              site. Gratuit, sans engagement.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
            >
              <a
                href={urlQuiz()}
                onClick={fermer}
                className="group inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-full bg-accent px-8 font-display text-base font-extrabold uppercase tracking-tight text-surface transition-colors hover:bg-accent-hover sm:w-auto"
              >
                Voir mon aperçu
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
              <button
                type="button"
                onClick={fermer}
                className="min-h-[44px] px-4 text-sm font-semibold text-text-muted transition-colors hover:text-text-primary"
              >
                Plus tard
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
