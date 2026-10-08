import { motion } from 'framer-motion'
import { LEVIERS } from '../AcquisitionSection'

const EASE = [0.22, 1, 0.36, 1] as const
/** Largeurs de la grille, en alternance large et étroite. */
const LARGEURS = ['md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-4']

/**
 * Les quatre leviers d'acquisition, en grille asymétrique.
 *
 * Les cartes larges et étroites s'emboîtent ; au survol, la carte passe au
 * chrome. Sur mobile, elles s'empilent simplement.
 */
export default function AcquisitionStudio() {
  return (
    <section id="acquisition" className="bg-surface px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 className="mt-6 max-w-5xl text-[9vw] text-text-primary md:text-5xl lg:text-6xl">
          Un beau site ne suffit pas. <span className="text-accent">Il doit être trouvé.</span>
        </h2>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-6">
          {LEVIERS.map((levier, i) => (
            <motion.article
              key={levier.titre}
              className={`group flex flex-col justify-between rounded-[1.75rem] bg-surface-card p-7 transition-colors duration-500 [@media(hover:hover)]:hover:bg-accent md:min-h-[24rem] md:p-10 ${LARGEURS[i]}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            >
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface">
                  {levier.titre}
                </p>
                <h3 className="mt-4 text-2xl font-normal leading-[1.05] tracking-tight text-text-primary transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface md:text-3xl">
                  {levier.accroche}
                </h3>
              </div>
              <ul className="mt-8 space-y-2">
                {levier.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-[15px] font-medium text-text-secondary transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface"
                  >
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent transition-colors duration-500 [@media(hover:hover)]:group-hover:bg-surface" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
