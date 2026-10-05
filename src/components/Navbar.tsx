import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion'

/**
 * Les entrées de navigation, écrites une seule fois.
 *
 * Elles étaient recopiées entre la barre du haut et le menu mobile : ajouter
 * une page demandait d'y penser deux fois, et les deux listes avaient déjà
 * divergé.
 */
const LIENS = [
  { libelle: 'Accueil', vers: '/', interne: true },
  { libelle: 'Projets', vers: '/#projets', interne: false },
  { libelle: "L'agence", vers: '/#agence', interne: false },
  { libelle: 'Contact', vers: '/contact', interne: true },
] as const

type Lien = (typeof LIENS)[number]

const QUIZ = 'https://quiz.digitalzdev.com'
const EASE = [0.32, 0.72, 0, 1] as const

/** Vrai pour la page affichée. Les ancres appartiennent toutes à l'accueil. */
function estCourant(lien: Lien, chemin: string): boolean {
  if (lien.vers === '/') return chemin === '/'
  if (lien.vers.startsWith('/#')) return false
  return chemin === lien.vers
}

function Fleche({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

/** Lien du routeur ou ancre de l'accueil, selon l'entrée. */
function LienNav({
  lien,
  className,
  onClick,
  children,
  ...reste
}: {
  lien: Lien
  className: string
  onClick?: () => void
  children: ReactNode
  onMouseEnter?: () => void
  'aria-current'?: 'page'
}) {
  return lien.interne ? (
    <Link to={lien.vers} className={className} onClick={onClick} {...reste}>
      {children}
    </Link>
  ) : (
    <a href={lien.vers} className={className} onClick={onClick} {...reste}>
      {children}
    </a>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [survol, setSurvol] = useState<string | null>(null)
  const location = useLocation()
  const { scrollY } = useScroll()

  /**
   * La barre reste accrochée en haut de l'écran en permanence.
   *
   * En haut de page, elle est transparente et se fond dans le haut de page ;
   * dès qu'on descend, elle devient une pastille flottante sur fond flouté,
   * lisible par-dessus n'importe quelle section.
   */
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  /**
   * Menu ouvert, la page dessous ne bouge plus et Échap referme.
   *
   * Sans le verrou, le doigt qui dépasse du menu fait défiler l'article
   * derrière le voile : on referme et on a changé d'endroit sans l'avoir
   * demandé. Et un panneau qui couvre tout l'écran doit se refermer au
   * clavier, sinon on y est enfermé dès qu'on ne vise pas la croix.
   */
  useEffect(() => {
    if (!menuOpen) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', auClavier)

    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', auClavier)
    }
  }, [menuOpen])

  // Les ancres de l'accueil ne changent pas la route : sans cette fermeture
  // explicite, le menu resterait ouvert par-dessus la section visée.
  const fermer = () => setMenuOpen(false)

  const pastille = scrolled || menuOpen
  const lienSurvole = survol ?? LIENS.find((l) => estCourant(l, location.pathname))?.libelle

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <nav
          aria-label="Navigation principale"
          className={`mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-2 pl-2 pr-2 transition-[background-color,box-shadow,backdrop-filter] duration-500 sm:pl-3 ${
            pastille
              ? 'bg-surface/75 shadow-[0_10px_40px_-12px_rgba(40,28,18,0.18)] backdrop-blur-xl'
              : 'bg-transparent'
          }`}
        >
          <Link
            to="/"
            onClick={fermer}
            className="group flex min-h-[44px] min-w-0 items-center gap-2.5 rounded-full pr-3"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-10 w-10 shrink-0 rounded-full transition-transform duration-500 group-hover:rotate-[-8deg]"
            />
            <span className="truncate font-display text-[17px] font-extrabold tracking-tight text-text-primary">
              Digitalz <span className="font-semibold text-accent">Dev</span>
            </span>
          </Link>

          {/* Ordinateur : la pastille de survol glisse d'un lien à l'autre et
              revient se poser sur la page courante. */}
          <div
            className="hidden items-center gap-1 md:flex"
            onMouseLeave={() => setSurvol(null)}
          >
            {LIENS.map((lien) => {
              const courant = estCourant(lien, location.pathname)
              return (
                <LienNav
                  key={lien.libelle}
                  lien={lien}
                  onMouseEnter={() => setSurvol(lien.libelle)}
                  aria-current={courant ? 'page' : undefined}
                  className={`relative isolate inline-flex min-h-[44px] items-center rounded-full px-4 text-[15px] font-semibold transition-colors ${
                    courant ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {lienSurvole === lien.libelle && (
                    <motion.span
                      layoutId="nav-pastille"
                      className="absolute inset-0 -z-10 rounded-full bg-surface-light"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  {lien.libelle}
                </LienNav>
              )
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Le quiz est hébergé sur un sous-domaine : lien externe, pas
                une route interne du routeur. */}
            <a
              href={QUIZ}
              className="group hidden min-h-[44px] items-center gap-2 rounded-full bg-accent pl-5 pr-4 font-display text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover md:inline-flex"
            >
              Ma démo gratuite
              <Fleche className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>

            {/* Mobile : un bouton rond, deux traits qui se croisent en X. */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 md:hidden ${
                menuOpen ? 'bg-accent text-surface' : 'bg-surface-card text-text-primary shadow-[0_4px_16px_-6px_rgba(40,28,18,0.25)]'
              }`}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              <motion.span
                className="absolute h-[2px] w-[18px] rounded-full bg-current"
                animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
              <motion.span
                className="absolute h-[2px] rounded-full bg-current"
                animate={
                  menuOpen
                    ? { rotate: -45, y: 0, width: 18, x: 0 }
                    : { rotate: 0, y: 4, width: 12, x: 3 }
                }
                transition={{ duration: 0.3, ease: EASE }}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu-mobile"
            // `md:hidden` : si la fenêtre s'élargit menu ouvert, le panneau
            // disparaît avec le bouton qui l'a ouvert.
            className="fixed inset-0 z-40 flex flex-col bg-surface md:hidden"
            // Le panneau s'ouvre en cercle depuis le bouton : on voit d'où il
            // vient, et donc où le refermer.
            initial={{ clipPath: 'circle(0px at calc(100% - 42px) 38px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 42px) 38px)' }}
            exit={{ clipPath: 'circle(0px at calc(100% - 42px) 38px)' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <nav
              aria-label="Menu"
              className="flex flex-1 flex-col justify-center overflow-y-auto overscroll-contain px-7 pb-6 pt-24"
            >
              <ul>
                {LIENS.map((lien, i) => {
                  const courant = estCourant(lien, location.pathname)
                  return (
                    <motion.li
                      key={lien.libelle}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.45, delay: 0.12 + i * 0.06, ease: EASE }}
                    >
                      <LienNav
                        lien={lien}
                        onClick={fermer}
                        aria-current={courant ? 'page' : undefined}
                        className="group flex min-h-[52px] items-center gap-3 active:opacity-60"
                      >
                        <span
                          className={`font-display text-2xl font-bold leading-none tracking-tight ${
                            courant ? 'text-accent' : 'text-text-primary'
                          }`}
                        >
                          {lien.libelle}
                        </span>
                        {courant ? (
                          <span className="ml-1 h-2 w-2 rounded-full bg-accent" aria-hidden />
                        ) : (
                          <Fleche className="ml-auto h-4 w-4 text-text-muted" />
                        )}
                      </LienNav>
                    </motion.li>
                  )
                })}
              </ul>
            </nav>

            <motion.div
              className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.45, delay: 0.12 + LIENS.length * 0.06, ease: EASE }}
            >
              <a
                href={QUIZ}
                className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-full bg-accent font-display text-lg font-bold text-surface transition-colors active:bg-accent-hover"
              >
                Générer ma démo gratuite
                <Fleche className="h-5 w-5" />
              </a>

              <div className="mt-5 flex items-center justify-between rounded-3xl bg-surface-light px-5 py-4">
                <a
                  href="mailto:zdigitalzdev@gmail.com"
                  className="min-w-0 truncate text-sm font-semibold text-text-secondary"
                >
                  zdigitalzdev@gmail.com
                </a>
                <div className="flex shrink-0 items-center">
                  <a
                    href="https://www.instagram.com/digitalzdev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center text-text-secondary"
                  >
                    <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/zakariya-nebbache-7b0644214/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-10 w-10 items-center justify-center text-text-secondary"
                  >
                    <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
