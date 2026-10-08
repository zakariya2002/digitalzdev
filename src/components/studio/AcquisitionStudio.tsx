import { motion } from 'framer-motion'
import { LEVIERS } from '../AcquisitionSection'
import RechercheGoogle from './RechercheGoogle'

const EASE = [0.22, 1, 0.36, 1] as const
/** Largeurs de la grille, en alternance large et étroite. */
const LARGEURS = ['md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-4']

/**
 * Couleur de chaque carte au survol : noir, gris, bleu, jaune. Les classes
 * sont écrites en entier pour que Tailwind les génère.
 */
const SURVOL = [
  { carte: '[@media(hover:hover)]:hover:bg-[#1d1d1f]', texte: '[@media(hover:hover)]:group-hover:text-white', puce: '[@media(hover:hover)]:group-hover:bg-white' },
  { carte: '[@media(hover:hover)]:hover:bg-[#6e7177]', texte: '[@media(hover:hover)]:group-hover:text-white', puce: '[@media(hover:hover)]:group-hover:bg-white' },
  { carte: '[@media(hover:hover)]:hover:bg-pop', texte: '[@media(hover:hover)]:group-hover:text-white', puce: '[@media(hover:hover)]:group-hover:bg-white' },
  { carte: '[@media(hover:hover)]:hover:bg-citron', texte: '[@media(hover:hover)]:group-hover:text-[#1d1d1f]', puce: '[@media(hover:hover)]:group-hover:bg-[#1d1d1f]' },
]

/**
 * Les quatre leviers d'acquisition, en grille asymétrique.
 *
 * Les cartes larges et étroites s'emboîtent ; au survol, la carte passe au
 * chrome. Sur mobile, elles s'empilent simplement.
 */
export default function AcquisitionStudio() {
  return (
 <>
    {/* La recherche Google rejouée au défilement */}
    <div id="acquisition">
      <RechercheGoogle />
    </div>

    <section className="bg-surface px-5 pb-8 pt-16 md:px-10 md:pb-10 md:pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 md:grid-cols-6">
          {LEVIERS.map((levier, i) => (
            <motion.article
              key={levier.titre}
              className={`group flex flex-col justify-between rounded-[1.75rem] bg-surface-card p-7 transition-colors duration-500 md:min-h-[24rem] md:p-10 ${SURVOL[i].carte} ${LARGEURS[i]}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            >
              <div>
                <p className={`text-sm font-medium text-accent transition-colors duration-500 ${SURVOL[i].texte}`}>
                  {levier.titre}
                </p>
                <h3 className={`mt-4 text-2xl font-normal leading-[1.05] tracking-tight text-text-primary transition-colors duration-500 md:text-3xl ${SURVOL[i].texte}`}>
                  {levier.accroche}
                </h3>
              </div>
              <ul className="mt-8 space-y-2">
                {levier.points.map((point) => (
                  <li
                    key={point}
                    className={`flex gap-3 text-[15px] font-medium text-text-secondary transition-colors duration-500 ${SURVOL[i].texte}`}
                  >
                    <span aria-hidden className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pop transition-colors duration-500 ${SURVOL[i].puce}`} />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}
