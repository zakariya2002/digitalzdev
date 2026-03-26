import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  )
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const ThemeIcon = () =>
    isDark ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    )

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-surface/80 backdrop-blur-xl border-b border-surface-border'
            : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Digitalz Dev"
              className="w-10 h-10 rounded-full"
            />
            <span className="font-display font-semibold text-sm tracking-[0.15em] text-text-primary group-hover:text-accent transition-colors">
              DIGITALZ DEV
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Accueil
            </Link>
            <a
              href="/#projets"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Projets
            </a>
            <button
              onClick={toggleDark}
              className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
              aria-label="Basculer le thème"
            >
              <ThemeIcon />
            </button>
            <Link
              to="/contact"
              className="text-sm px-5 py-2 bg-accent/10 text-accent border border-accent/20 rounded-full hover:bg-accent/20 transition-all"
            >
              Contact
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleDark}
              className="p-2 rounded-full text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Basculer le thème"
            >
              <ThemeIcon />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col gap-1.5 p-2"
              aria-label="Menu"
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
            className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Link
              to="/"
              className="text-2xl font-display font-semibold text-text-primary"
            >
              Accueil
            </Link>
            <a
              href="/#projets"
              className="text-2xl font-display font-semibold text-text-primary"
            >
              Projets
            </a>
            <Link
              to="/contact"
              className="text-lg px-8 py-3 bg-text-primary text-surface rounded-full font-semibold"
            >
              Contact
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
