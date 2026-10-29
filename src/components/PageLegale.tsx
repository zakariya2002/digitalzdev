import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from './Footer'

/**
 * Gabarit des pages légales : titre, date de mise à jour, puis des blocs
 * titrés. Les textes eux-mêmes vivent dans chaque page.
 */
export default function PageLegale({ titre, miseAJour, children }: { titre: string; miseAJour: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-surface">
      <section className="px-6 pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              to="/"
              className="-mt-3 mb-5 inline-flex min-h-[44px] items-center gap-2 py-3 text-sm text-text-secondary transition-colors hover:text-accent"
            >
              <span>←</span> Retour
            </Link>
          </motion.div>

          <motion.h1
            className="mb-3 font-display text-3xl font-black text-text-primary [hyphens:auto] sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {titre}
          </motion.h1>
          <p className="mb-12 text-sm text-text-muted">Dernière mise à jour : {miseAJour}</p>

          <motion.div
            className="space-y-10 leading-relaxed text-text-secondary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 font-display text-xl font-bold text-text-primary">{titre}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export function Lien({ href, children }: { href: string; children: ReactNode }) {
  const externe = href.startsWith('http')
  return (
    <a
      href={href}
      target={externe ? '_blank' : undefined}
      rel={externe ? 'noopener noreferrer' : undefined}
      className="text-accent underline underline-offset-2"
    >
      {children}
    </a>
  )
}
