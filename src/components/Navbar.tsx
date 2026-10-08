import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'

/**
 * Les entrées de navigation, écrites une seule fois pour la barre et le menu.
 */
const LIENS = [
  { libelle: 'Accueil', vers: '/', interne: true },
  { libelle: 'Projets', vers: '/#projets', interne: false },
  { libelle: 'Services', vers: '/#services', interne: false },
  { libelle: "L'agence", vers: '/#agence', interne: false },
  { libelle: 'Contact', vers: '/contact', interne: true },
] as const

type Lien = (typeof LIENS)[number]

const QUIZ = 'https://quiz.digitalzdev.com'
const EASE = [0.76, 0, 0.24, 1] as const

function estCourant(lien: Lien, chemin: string): boolean {
  if (lien.vers === '/') return chemin === '/'
  if (lien.vers.startsWith('/#')) return false
  return chemin === lien.vers
}

/** L'heure à Paris, rafraîchie toutes les trente secondes. */
function Heure() {
  const formater = () =>
    new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    }).format(new Date())
  const [heure, setHeure] = useState<string | null>(null)
  useEffect(() => {
    setHeure(formater())
    const t = window.setInterval(() => setHeure(formater()), 30_000)
    return () => window.clearInterval(t)
  }, [])
  return (
    <span className="text-sm font-medium text-text-secondary">
      Paris, France <span className="text-text-primary">{heure ?? ''}</span>
    </span>
  )
}

/**
 * Barre de navigation et menu plein écran.
 *
 * La barre reste accrochée en haut, transparente sur le haut de page puis
 * sur fond flouté dès qu'on descend. Le menu, le même sur tous les écrans,
 * couvre la page et liste les sections en très grand.
 */
export default function Navbar() {
  const [defile, setDefile] = useState(false)
  // Comme sur butter.video : au survol des trois points, la pastille se
  // déplie et montre les liens ; un clic la garde ouverte.
  const [survol, setSurvol] = useState(false)
  const [epingle, setEpingle] = useState(false)
  const liensVisibles = !defile || survol || epingle
  const [ouvert, setOuvert] = useState(false)
  const location = useLocation()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setDefile(y > 24))

  useEffect(() => setOuvert(false), [location])

  // Menu ouvert : la page ne défile plus, Échap referme.
  useEffect(() => {
    if (!ouvert) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const clavier = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false)
    window.addEventListener('keydown', clavier)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', clavier)
    }
  }, [ouvert])

  const fermer = () => setOuvert(false)

  return (
    <>
      {/* Deux pastilles flottantes, comme sur butter.video : à gauche le
          logo, les liens et le menu ; à droite le contact et l'appel à
          l'action. Dès qu'on descend, les liens se replient dans la pastille
          et seuls le logo et le bouton de menu restent. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 px-3 pt-3 md:px-6 md:pt-5">
        <nav
          aria-label="Navigation principale"
          className="pointer-events-auto flex items-center rounded-2xl bg-surface-card/75 py-1.5 pl-3 pr-1.5 backdrop-blur-xl md:pl-4"
          onPointerLeave={() => setSurvol(false)}
        >
          <Link to="/" onClick={fermer} className="group flex min-h-[44px] items-center gap-2.5 pr-2">
            <img
              src="/logo-studio.png"
              alt=""
              className="h-8 w-8 rounded-full transition-transform duration-500 group-hover:rotate-[-12deg]"
            />
            <span className="hidden whitespace-nowrap text-[17px] font-medium tracking-tight text-text-primary sm:inline">Digitalz Dev</span>
          </Link>

          <motion.div
            className="hidden overflow-hidden lg:block"
            initial={false}
            animate={{ width: liensVisibles ? 'auto' : 0, opacity: liensVisibles ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="flex items-center gap-1 whitespace-nowrap pl-4">
              {LIENS.filter((l) => l.vers !== '/').map((lien) => {
                const classe =
                  'inline-flex min-h-[40px] items-center rounded-xl px-3 text-[15px] text-text-primary transition-colors hover:text-text-muted'
                return (
                  <li key={lien.libelle}>
                    {lien.interne ? (
                      <Link to={lien.vers} className={classe}>{lien.libelle}</Link>
                    ) : (
                      <a href={lien.vers} className={classe}>{lien.libelle}</a>
                    )}
                  </li>
                )
              })}
            </ul>
          </motion.div>

          <button
            type="button"
            onPointerEnter={(e) => e.pointerType === 'mouse' && setSurvol(true)}
            onClick={() => {
              // Sur grand écran, les trois points déplient la barre ; en
              // dessous, ils ouvrent le menu plein écran.
              if (window.matchMedia('(min-width: 1024px)').matches) setEpingle((v) => !v)
              else setOuvert((o) => !o)
            }}
            aria-expanded={ouvert}
            aria-controls="menu-plein-ecran"
            aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="relative z-[60] ml-1 flex h-10 w-10 items-center justify-center rounded-xl text-text-primary transition-colors hover:bg-surface-border/60"
          >
            {ouvert ? (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
              </svg>
            ) : (
              <svg viewBox="0 0 4 16" className="h-4 w-1" fill="currentColor" aria-hidden>
                <circle cx="2" cy="2" r="1.6" />
                <circle cx="2" cy="8" r="1.6" />
                <circle cx="2" cy="14" r="1.6" />
              </svg>
            )}
          </button>
        </nav>

        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl bg-surface-card/75 p-1.5 backdrop-blur-xl">
          <Link
            to="/contact"
            className="hidden min-h-[40px] items-center rounded-xl px-4 text-[15px] text-text-primary transition-colors hover:bg-surface-border/60 sm:inline-flex"
          >
            Contact
          </Link>
          <a
            href={QUIZ}
            className="inline-flex min-h-[40px] items-center whitespace-nowrap rounded-xl bg-accent px-4 text-[15px] font-semibold text-surface transition-colors hover:bg-accent-hover"
          >
            <span className="sm:hidden">Démo gratuite</span>
            <span className="hidden sm:inline">Ma démo gratuite</span>
          </a>
        </div>
      </header>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            id="menu-plein-ecran"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-surface-light px-5 pb-8 pt-28 md:px-10 md:pb-10"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <nav aria-label="Menu">
              <ul>
                {LIENS.map((lien, i) => {
                  const courant = estCourant(lien, location.pathname)
                  const classe = `group inline-flex items-center gap-4 text-[13vw] font-normal leading-[0.95] tracking-[-0.05em] transition-colors md:text-[7.5vw] ${
                    courant ? 'text-accent' : 'text-text-primary hover:text-accent'
                  }`
                  const contenu = (
                    <>
                      {lien.libelle}
                      <span
                        aria-hidden
                        className="text-[0.4em] opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100"
                      >
                        →
                      </span>
                    </>
                  )
                  return (
                    <li key={lien.libelle} className="overflow-hidden">
                      <motion.div
                        initial={{ y: '110%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '110%' }}
                        transition={{ duration: 0.6, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {lien.interne ? (
                          <Link to={lien.vers} onClick={fermer} className={classe} aria-current={courant ? 'page' : undefined}>
                            {contenu}
                          </Link>
                        ) : (
                          <a href={lien.vers} onClick={fermer} className={classe}>
                            {contenu}
                          </a>
                        )}
                      </motion.div>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <motion.div
              className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex flex-col gap-1 text-[15px] font-medium text-text-secondary">
                <Heure />
                <a href="mailto:zdigitalzdev@gmail.com" className="transition-colors hover:text-accent">
                  zdigitalzdev@gmail.com
                </a>
                <a
                  href="https://www.instagram.com/digitalzdev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  Instagram
                </a>
                <a
                  href="https://www.linkedin.com/in/zakariya-nebbache-7b0644214/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  LinkedIn
                </a>
              </div>
              <a
                href={QUIZ}
                className="inline-flex min-h-[60px] w-full items-center justify-center rounded-full bg-accent px-8 text-lg font-medium text-surface transition-colors hover:bg-accent-hover md:w-auto"
              >
                Générer ma démo gratuite →
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
