import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Les entrées de navigation, écrites une seule fois.
 *
 * Elles étaient recopiées entre la barre du haut et le menu mobile : ajouter
 * une page demandait d'y penser deux fois, et les deux listes avaient déjà
 * divergé.
 */
const LIENS = [
  { libelle: 'Accueil', vers: '/', interne: true, appui: false },
  { libelle: 'Projets', vers: '/#projets', interne: false, appui: false },
  { libelle: "L'agence", vers: '/#agence', interne: false, appui: false },
  // Contact est mis en couleur dans la barre du haut : c'est la sortie qu'on
  // veut voir en premier quand on cherche à joindre quelqu'un.
  { libelle: 'Contact', vers: '/contact', interne: true, appui: true },
] as const

type Lien = (typeof LIENS)[number]

/** Vrai pour la page affichée. Les ancres appartiennent toutes à l'accueil. */
function estCourant(lien: Lien, chemin: string): boolean {
  if (lien.vers === '/') return chemin === '/'
  if (lien.vers.startsWith('/#')) return false
  return chemin === lien.vers
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-surface/80 backdrop-blur-xl' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="group flex min-h-[44px] min-w-0 items-center gap-2 sm:gap-3"
          >
            <img
              src="/logo.png"
              alt="Digitalz Dev"
              className="w-10 h-10 rounded-full"
            />
            <span className="truncate font-display font-semibold text-[13px] sm:text-sm tracking-[0.12em] sm:tracking-[0.15em] text-text-primary group-hover:text-accent transition-colors">
              DIGITALZ DEV
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {LIENS.map((lien) => {
              const classe = lien.appui
                ? '-my-3 inline-flex min-h-[44px] items-center py-3 text-sm text-accent transition-opacity hover:opacity-80'
                : '-my-3 inline-flex min-h-[44px] items-center py-3 text-sm text-text-secondary transition-colors hover:text-text-primary'
              return lien.interne ? (
                <Link key={lien.libelle} to={lien.vers} className={classe}>
                  {lien.libelle}
                </Link>
              ) : (
                <a key={lien.libelle} href={lien.vers} className={classe}>
                  {lien.libelle}
                </a>
              )
            })}
            {/* Le quiz est hébergé sur un sous-domaine : lien externe, pas
                une route interne du routeur. */}
            <a
              href="https://quiz.digitalzdev.com"
              className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-5 font-display text-sm font-semibold text-surface transition-colors hover:bg-accent-hover"
            >
              Démarrer
            </a>
          </div>

          {/* Mobile */}
          <div className="flex shrink-0 md:hidden items-center gap-1">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-1.5"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              <motion.span
                className="w-6 h-0.5 bg-text-primary block"
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }}
              />
              <motion.span
                className="w-6 h-0.5 bg-text-primary block"
                animate={{ opacity: menuOpen ? 0 : 1 }}
              />
              <motion.span
                className="w-6 h-0.5 bg-text-primary block"
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }}
              />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu-mobile"
            // `md:hidden` : si la fenêtre s'élargit menu ouvert, le voile
            // disparaît avec le bouton qui l'a ouvert.
            className="fixed inset-0 z-40 flex flex-col bg-surface/95 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Les liens commencent haut et l'appel à l'action tient le bas.
                Centrés, quatre liens flottaient au milieu d'un écran vide, avec
                autant de vide au-dessus qu'en dessous : le menu paraissait
                inachevé. Alignés à gauche, ils reprennent l'aplomb du logo et
                tombent sous le pouce. */}
            <nav className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-28">
              {LIENS.map((lien, i) => {
                const courant = estCourant(lien, location.pathname)
                const contenu = (
                  <span className="relative inline-block">
                    {lien.libelle}
                    {/* Le soulignement dit où l'on se trouve. C'est la seule
                        chose qui distingue la page courante une fois le menu
                        ouvert, la barre de navigation étant cachée dessous. */}
                    {courant && (
                      <motion.span
                        layoutId="menu-courant"
                        className="absolute -bottom-1 left-0 h-[2px] w-full bg-accent"
                      />
                    )}
                  </span>
                )
                const classe =
                  'flex min-h-[56px] items-center font-display text-[2rem] font-semibold leading-none tracking-tight text-text-primary transition-opacity active:opacity-60'

                return (
                  <motion.div
                    key={lien.libelle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      delay: 0.04 + i * 0.045,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  >
                    {lien.interne ? (
                      <Link to={lien.vers} className={classe}>
                        {contenu}
                      </Link>
                    ) : (
                      <a href={lien.vers} className={classe}>
                        {contenu}
                      </a>
                    )}
                  </motion.div>
                )
              })}
            </nav>

            {/* Le quiz est hébergé sur un sous-domaine : lien externe, pas une
                route interne du routeur. */}
            <motion.div
              className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.28,
                delay: 0.04 + LIENS.length * 0.045,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              <a
                href="https://quiz.digitalzdev.com"
                className="flex min-h-[56px] w-full items-center justify-center rounded-full bg-accent font-display text-lg font-semibold text-surface transition-colors active:bg-accent-hover"
              >
                Démarrer
              </a>
              <p className="mt-3 text-center text-xs text-text-secondary">
                Un aperçu de votre site en huit questions
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
