import { useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Magnetic } from './motion'
import HeroVideo from './HeroVideo'
import CalendlyModal from './CalendlyModal'

const EASE = [0.22, 1, 0.36, 1] as const

/** Une ligne de titre qui monte depuis derrière son propre masque. */
function Ligne({ children, delai }: { children: ReactNode; delai: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: delai, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/**
 * Haut de page de la V3.
 *
 * Une promesse en grand serif, adressée aux trois métiers visés, deux
 * sorties claires, puis la vidéo en grand format. Le registre est celui des
 * sites d'architectes et de cabinets primés : beaucoup d'espace, peu de mots,
 * des mouvements courts.
 */
export default function Hero() {
  const videoRef = useRef<HTMLDivElement>(null)
  const [rdvOuvert, setRdvOuvert] = useState(false)

  // Parallaxe légère de la vidéo pendant qu'elle traverse l'écran.
  const { scrollYProgress } = useScroll({
    target: videoRef,
    offset: ['start end', 'end start'],
  })
  const videoY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])

  return (
    <section className="relative bg-surface pb-16 pt-32 md:pb-24 md:pt-44">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <motion.p
          className="font-display text-xs uppercase tracking-[0.3em] text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Agence web · Avocats, architectes, métiers de l'image
        </motion.p>

        <h1 className="mt-6 text-[13vw] text-text-primary sm:text-[10vw] lg:text-[min(8.4vw,148px)]">
          <Ligne delai={0.2}>Des sites à la hauteur</Ligne>
          <Ligne delai={0.32}>
            de votre <em className="text-accent">réputation</em>.
          </Ligne>
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-md text-base leading-relaxed text-text-secondary md:text-lg"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          >
            Cabinets d'avocats, agences d'architecture, photographes et
            vidéastes : nous concevons des sites sobres et rapides, qui
            inspirent confiance et font venir les bons clients.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.72, ease: EASE }}
          >
            <Magnetic className="inline-block">
              <button
                type="button"
                onClick={() => setRdvOuvert(true)}
                className="inline-flex min-h-[54px] items-center rounded-full bg-accent px-7 font-display text-[15px] font-semibold text-surface transition-colors hover:bg-accent-hover"
              >
                Prendre rendez-vous
              </button>
            </Magnetic>
            <a
              href="https://quiz.digitalzdev.com"
              className="group inline-flex min-h-[54px] items-center gap-2 rounded-full bg-surface-light px-7 font-display text-[15px] font-semibold text-text-primary transition-colors hover:bg-surface-card"
            >
              Voir un aperçu de mon site
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* La vidéo se dévoile de bas en haut, puis glisse légèrement au
          défilement. */}
      <div ref={videoRef} className="mx-auto mt-14 max-w-7xl px-5 md:mt-20 md:px-10">
        <motion.div
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
        >
          <motion.div style={{ y: videoY }}>
            <HeroVideo />
          </motion.div>
        </motion.div>
      </div>

      <CalendlyModal open={rdvOuvert} onClose={() => setRdvOuvert(false)} />
    </section>
  )
}
