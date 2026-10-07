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
    <span className="text-sm font-bold text-text-secondary">
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
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          defile && !ouvert ? 'bg-surface/70 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <nav
          aria-label="Navigation principale"
          className="flex items-center justify-between gap-4 px-5 py-4 md:px-10 md:py-5"
        >
          <Link to="/" onClick={fermer} className="group flex min-h-[44px] items-center gap-3">
            <img
              src="/logo-studio.png"
              alt=""
              className="h-10 w-10 rounded-full transition-transform duration-500 group-hover:rotate-[-12deg]"
            />
            <span className="text-lg font-black tracking-tight text-text-primary">
              Digitalz <span className="text-accent">Dev</span>
            </span>
          </Link>

          <div className="hidden lg:block">
            <Heure />
          </div>

          <div className="flex items-center gap-2">
            <a
              href={QUIZ}
              className="hidden min-h-[44px] items-center rounded-full bg-accent px-5 text-[15px] font-extrabold text-surface transition-colors hover:bg-accent-hover sm:inline-flex"
            >
              Ma démo gratuite
            </a>
            <button
              type="button"
              onClick={() => setOuvert((o) => !o)}
              aria-expanded={ouvert}
              aria-controls="menu-plein-ecran"
              className="relative z-[60] inline-flex min-h-[44px] items-center gap-3 rounded-full bg-surface-card px-5 text-[15px] font-extrabold text-text-primary transition-colors hover:bg-surface-border"
            >
              <span>{ouvert ? 'Fermer' : 'Menu'}</span>
              <span aria-hidden className="relative block h-3 w-4">
                <motion.span
                  className="absolute left-0 top-0 h-[2px] w-full rounded-full bg-current"
                  animate={ouvert ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-current"
                  animate={ouvert ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                />
              </span>
            </button>
          </div>
        </nav>
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
                  const classe = `group inline-flex items-center gap-4 text-[13vw] font-black leading-[0.95] tracking-[-0.05em] transition-colors md:text-[7.5vw] ${
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
              <div className="flex flex-col gap-1 text-[15px] font-bold text-text-secondary">
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
                className="inline-flex min-h-[60px] w-full items-center justify-center rounded-full bg-accent px-8 text-lg font-extrabold text-surface transition-colors hover:bg-accent-hover md:w-auto"
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
