import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'

/**
 * Le pied de page porte le maillage interne du site.
 *
 * Une application monopage n'offre presque aucun lien entre ses pages : le
 * site n'en comptait qu'une douzaine, contre soixante à soixante-dix chez les
 * agences bien positionnées. Lister les réalisations et les sections ici les
 * rend atteignables depuis n'importe quelle page, pour un visiteur comme pour
 * un robot.
 */
const RACCOURCIS = [
  { to: '/#services', label: 'Nos services' },
  { to: '/#projets', label: 'Nos réalisations' },
  { to: '/#agence', label: "L'agence" },
  { to: '/#faq', label: 'Questions fréquentes' },
  { to: '/contact', label: 'Nous contacter' },
  // Point d'entrée principal : plutôt qu'un formulaire de devis, le visiteur
  // repart avec un aperçu de son site en une minute.
  { to: 'https://quiz.digitalzdev.com', label: 'Générer ma démo gratuite', externe: true },
]

const RESEAUX = [
  { href: 'https://www.instagram.com/digitalzdev/', label: 'Instagram' },
  { href: 'https://www.linkedin.com/in/zakariya-nebbache-7b0644214/', label: 'LinkedIn' },
  { href: 'mailto:zdigitalzdev@gmail.com', label: 'zdigitalzdev@gmail.com' },
]

const lien = 'inline-block py-2 text-[15px] font-medium text-text-secondary transition-colors hover:text-accent'

export default function Footer() {
  return (
    <footer className="overflow-hidden bg-surface px-5 pt-10 md:px-10 md:pt-14">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Plan du site" className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-sm font-medium text-text-muted">Le site</p>
            <ul className="mt-4">
              {RACCOURCIS.map((l) => (
                <li key={l.to}>
                  {l.externe ? (
                    <a href={l.to} className={lien}>{l.label}</a>
                  ) : (
                    <Link to={l.to} className={lien}>{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm font-medium text-text-muted">Réalisations</p>
            <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link to={p.route} className={lien}>
                    {p.title}
                    <span className="font-medium text-text-muted"> · {p.subtitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-sm font-medium text-text-muted">Nous suivre</p>
            <ul className="mt-4">
              {RESEAUX.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target={r.href.startsWith('http') ? '_blank' : undefined}
                    rel={r.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={lien}
                  >
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mt-14 flex flex-col gap-3 text-sm font-medium text-text-muted md:flex-row md:items-center md:justify-between">
          <p>Digitalz Dev &copy; {new Date().getFullYear()} · Tous droits réservés</p>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="py-2 transition-colors hover:text-accent">
              Mentions légales
            </Link>
            <Link to="/politique-confidentialite" className="py-2 transition-colors hover:text-accent">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>

      {/* Le nom, en lettres géantes, en bas de page ; le jambage du « g » reste visible */}
      <div className="mt-10 overflow-hidden">
        <motion.p
          aria-hidden
          className="whitespace-nowrap pb-[0.06em] text-center text-[13vw] font-normal leading-[1.05] tracking-[-0.06em] text-text-primary"
          initial={{ y: '60%' }}
          whileInView={{ y: '0%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Digitalz <span className="text-accent">Dev</span>
        </motion.p>
      </div>
    </footer>
  )
}
