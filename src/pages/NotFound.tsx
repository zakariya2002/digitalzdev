import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="bg-surface min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <motion.h1
          className="font-display font-black text-8xl md:text-[12rem] text-text-primary leading-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          404
        </motion.h1>
        <motion.p
          className="text-text-secondary text-lg md:text-xl mt-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Cette page n'existe pas ou a été déplacée.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/"
            className="px-8 py-3 bg-text-primary text-surface rounded-full font-display font-semibold inline-block hover:opacity-90 transition-all"
          >
            Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
