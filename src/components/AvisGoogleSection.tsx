import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal, SplitText } from './motion'
import { EASE_OUT, VIEWPORT } from './motion/config'
import { avisGoogle, ficheGoogle, type AvisGoogle } from '../data/avisGoogle'

function Etoiles({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${note} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i < Math.round(note) ? 'text-accent' : 'text-surface-border'}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  )
}

function LogoGoogle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#fff" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
      <path fill="#fff" fillOpacity=".85" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
      <path fill="#fff" fillOpacity=".7" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" />
      <path fill="#fff" fillOpacity=".55" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
    </svg>
  )
}

/**
 * Les avis Google, sous les réalisations.
 *
 * Alimentée par data/avisGoogle.ts. Tant que la liste est vide, la section
 * ne s'affiche pas en ligne ; en local, un encart rappelle qu'elle attend les
 * vrais avis, pour qu'on voie où elle se placera.
 */
/**
 * Avis d'exemple, pour juger la mise en page tant que la fiche Google n'a
 * pas fourni les vrais. Ils s'affichent en local et sur les prévisualisations,
 * avec la mention « Avis d'exemple », jamais sur digitalzdev.com : le site en
 * ligne n'affiche que data/avisGoogle.ts.
 */
const EXEMPLES: AvisGoogle[] = [
  { auteur: 'Sarah M.', note: 5, texte: "Site livré en trois semaines comme prévu. On reçoit maintenant des demandes de devis chaque semaine par le formulaire, ce qui n'arrivait jamais avec l'ancien.", date: 'il y a 2 semaines' },
  { auteur: 'Karim B.', note: 5, texte: "Très à l'écoute, ils ont repris ma boutique Shopify de A à Z. Les fiches produits sont bien plus claires et le paiement en plusieurs fois a vraiment débloqué des ventes.", date: 'il y a 1 mois' },
  { auteur: 'Julie R.', note: 5, texte: "Ils ont aussi optimisé ma fiche Google et lancé une petite campagne : je suis passée devant mes concurrents sur Maps en quelques semaines. Je recommande.", date: 'il y a 2 mois' },
]

/** Vrai hors du site en ligne : en local et sur les prévisualisations. */
function horsProduction(): boolean {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  return !/(^|\.)digitalzdev\.com$/.test(window.location.hostname)
}

export default function AvisGoogleSection() {
  const [exemplesPermis, setExemplesPermis] = useState(false)
  useEffect(() => setExemplesPermis(horsProduction()), [])

  const enExemple = avisGoogle.length === 0
  if (enExemple && !exemplesPermis) return null
  const liste = enExemple ? EXEMPLES : avisGoogle
  const fiche = enExemple ? { note: 4.9, total: null, lien: null } : ficheGoogle

  return (
    <section id="avis-google" className="relative overflow-hidden bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Avis Google
              </span>
            </Reveal>
            <SplitText
              as="h2"
              by="word"
              text="Nos clients en parlent mieux que nous."
              delay={0.1}
              className="mt-5 block max-w-3xl font-display text-4xl md:text-6xl"
            />
            {enExemple && (
              <p className="mt-4 text-sm text-text-muted">Avis d'exemple</p>
            )}
          </div>

          {fiche.note !== null && (
            <Reveal delay={0.2}>
              <div className="flex items-center gap-4 rounded-3xl bg-surface-card px-6 py-5">
                <LogoGoogle className="h-9 w-9" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-black text-text-primary">
                      {fiche.note.toLocaleString('fr-FR')}
                    </span>
                    <Etoiles note={fiche.note} />
                  </div>
                  {fiche.total !== null && (
                    <p className="text-sm text-text-secondary">
                      {fiche.total} avis sur Google
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3">
          {liste.map((avis, index) => (
            <motion.figure
              key={`${avis.auteur}-${index}`}
              className="flex flex-col rounded-3xl bg-surface-card p-7"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT }}
            >
              <div className="flex items-center justify-between">
                <Etoiles note={avis.note} />
                <LogoGoogle className="h-5 w-5" />
              </div>
              <blockquote className="mt-5 flex-1 text-base leading-relaxed text-text-primary">
                « {avis.texte} »
              </blockquote>
              <figcaption className="mt-6">
                <span className="block font-display font-extrabold text-text-primary">
                  {avis.auteur}
                </span>
                <span className="text-sm text-text-muted">{avis.date}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {fiche.lien && (
          <Reveal delay={0.1} className="mt-10 text-center">
            <a
              href={fiche.lien}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-accent transition-colors hover:text-accent-hover"
            >
              Voir tous nos avis sur Google ↗
            </a>
          </Reveal>
        )}
      </div>
    </section>
  )
}
