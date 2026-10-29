import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * La réalisation pour un cabinet d'avocats, en grand. Elle remplace la piste
 * horizontale de la V1, dont les autres projets ne concernent pas les avocats.
 */
export default function Reference() {
  return (
    <section id="realisation" className="bg-surface px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="text-sm font-medium text-accent">Réalisation</p>
          <h2 className="mt-4 text-[9vw] text-text-primary md:text-5xl lg:text-6xl">
            Fidal, <span className="font-bold text-pop">bureau de Montpellier.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-text-secondary">
            La page du bureau montpelliérain du cabinet d'avocats d'affaires :
            présentation, expertises, équipe et coordonnées, structurées pour
            ressortir sur les recherches locales d'avocat d'affaires.
          </p>
          <Link
            to="/fidal"
            data-curseur="Voir"
            className="mt-8 inline-flex min-h-[52px] items-center rounded-xl bg-[#0f0f0f] px-8 text-[16px] text-white transition-colors hover:bg-black"
          >
            Voir l'étude de cas
          </Link>
        </motion.div>
        <motion.div
          className="overflow-hidden rounded-[1.75rem] bg-surface-card lg:col-span-7"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.9, delay: 0.08, ease: EASE }}
        >
          <img
            src="/screenshots/fidal-hero.webp"
            alt="Page du bureau de Montpellier du cabinet Fidal"
            loading="lazy"
            decoding="async"
            className="block w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]"
          />
        </motion.div>
      </div>
    </section>
  )
}
