import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { WHATSAPP } from './contenu'
import Logo from './Logo'

const RACCOURCIS = [
  { to: '#services', label: 'Services' },
  { to: '#deontologie', label: 'Déontologie' },
  { to: '#realisation', label: 'Réalisation' },
  { to: '#faq', label: 'Questions fréquentes' },
]

const CONTACT = [
  { href: WHATSAPP, label: 'WhatsApp' },
  { href: 'https://www.linkedin.com/in/zakariya-nebbache-7b0644214/', label: 'LinkedIn' },
]

const lien = 'inline-block py-2 text-[15px] font-medium text-text-secondary transition-colors hover:text-accent'

export default function PiedDePage() {
  return (
    <footer className="overflow-hidden bg-surface px-5 pt-10 md:px-10 md:pt-14">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Plan du site" className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-sm font-medium text-text-muted">Le site</p>
            <ul className="mt-4">
              {RACCOURCIS.map((l) => (
                <li key={l.to}>
                  <a href={l.to} className={lien}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm font-medium text-text-muted">Prendre rendez-vous</p>
            <ul className="mt-4">
              <li>
                <Link to="/projet" className={lien}>Formulaire en quatre questions</Link>
              </li>
              {CONTACT.map((r) => (
                <li key={r.href}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer" className={lien}>
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs py-2 text-[15px] font-medium leading-relaxed text-text-secondary">
              Sites internet, prise de rendez-vous et visibilité en ligne,
              exclusivement pour les avocats et les cabinets d'avocats.
            </p>
          </div>
        </nav>

        <div className="mt-14 flex flex-col gap-3 text-sm font-medium text-text-muted md:flex-row md:items-center md:justify-between">
          <p>AvocatLeads &copy; {new Date().getFullYear()}, nom commercial de NEUROCARE SAS, RCS Bobigny 131 907 420. Société de services web, et non cabinet d'avocats.</p>
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
          className="whitespace-nowrap pb-[0.06em] text-center text-[14vw] font-bold leading-[1.05] tracking-[-0.05em] text-text-primary"
          style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}
          initial={{ y: '60%' }}
          whileInView={{ y: '0%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-light">avocat</span>
          <span>leads</span>
        </motion.p>
      </div>
    </footer>
  )
}
