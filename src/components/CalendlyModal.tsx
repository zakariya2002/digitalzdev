import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Lien de prise de rendez-vous.
 *
 * Écrit en clair plutôt que dans une variable d'environnement : c'est une
 * adresse publique, que n'importe quel visiteur lit dans la page, et une
 * variable de build imposerait de redéployer sans rien protéger.
 */
export const CALENDLY_URL =
  'https://calendly.com/zakariya-neurocare/call-decouverte-20min?hide_gdpr_banner=1'

const SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js'

interface FenetreCalendly extends Window {
  Calendly?: {
    initInlineWidget: (options: {
      url: string
      parentElement: HTMLElement
    }) => void
  }
}

/**
 * Charge le script Calendly une seule fois pour toute la page.
 *
 * Il s'initialise tout seul au chargement sur les éléments déjà présents.
 * Comme le nôtre n'existe qu'à l'ouverture de la fenêtre, on garde la
 * promesse de chargement et on appelle l'initialisation à la main.
 */
let chargement: Promise<void> | null = null

function chargerCalendly(): Promise<void> {
  if (chargement) return chargement
  chargement = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('script Calendly injoignable'))
    document.head.appendChild(script)
  })
  return chargement
}

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Prise de rendez-vous, par-dessus la page.
 *
 * Le bouton ouvrait une adresse mail : sur mobile, il lançait une application
 * de messagerie et beaucoup n'écrivaient jamais. Le calendrier, lui, se
 * remplit sur place, en trois clics.
 */
export default function CalendlyModal({ open, onClose }: Props) {
  const conteneur = useRef<HTMLDivElement>(null)

  const fermer = useCallback(() => {
    if (conteneur.current) conteneur.current.innerHTML = ''
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const gererTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer()
    }
    window.addEventListener('keydown', gererTouche)
    const defilementInitial = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', gererTouche)
      document.body.style.overflow = defilementInitial
    }
  }, [open, fermer])

  useEffect(() => {
    if (!open) return
    let annule = false
    void chargerCalendly()
      .then(() => {
        const cible = conteneur.current
        const fenetre = window as FenetreCalendly
        if (annule || !cible || !fenetre.Calendly) return
        cible.innerHTML = ''
        fenetre.Calendly.initInlineWidget({
          url: CALENDLY_URL,
          parentElement: cible,
        })
      })
      .catch((err: unknown) => console.error('[calendly]', err))
    return () => {
      annule = true
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={fermer}
            className="absolute inset-0 bg-text-primary/50 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendly-titre"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl border border-surface-border bg-surface-card sm:max-h-[92vh] sm:max-w-3xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
              <div>
                <h2
                  id="calendly-titre"
                  className="font-display text-xl font-bold text-text-primary sm:text-2xl"
                >
                  Parlons de votre projet
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                  Un appel court pour comprendre ce que vous voulez mettre en
                  place, ce dont vous disposez déjà, et ce que ça représente.
                  Vous repartez avec un devis précis, sans engagement.
                </p>
              </div>
              <button
                type="button"
                onClick={fermer}
                aria-label="Fermer"
                className="-m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
              <div
                ref={conteneur}
                className="h-[68vh] min-h-[560px] w-full overflow-hidden rounded-xl bg-white"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
