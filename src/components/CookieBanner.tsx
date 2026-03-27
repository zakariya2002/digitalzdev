import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-3xl mx-auto bg-surface-card border border-surface-border rounded-xl p-5 md:p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4">
            <p className="text-text-secondary text-sm leading-relaxed flex-1">
              Ce site utilise uniquement le stockage local pour mémoriser votre
              préférence de thème (clair/sombre). Aucun cookie tiers, aucun
              tracking.{' '}
              <Link
                to="/politique-confidentialite"
                className="text-accent underline"
              >
                Politique de confidentialité
              </Link>
            </p>
            <button
              onClick={accept}
              className="px-6 py-2.5 bg-text-primary text-surface text-sm font-display font-semibold rounded-lg hover:opacity-90 transition-all whitespace-nowrap"
            >
              Compris
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
