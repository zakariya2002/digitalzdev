import { motion } from 'framer-motion'
import { VERIFICATIONS } from './contenu'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Les vérifications déontologiques, en cartes sur fond marine. C'est la
 * section qui distingue AvocatLeads d'une agence généraliste.
 */
export default function Deontologie() {
  return (
    <section id="deontologie" className="bg-pop px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 className="text-[9vw] text-white md:text-5xl lg:col-span-7 lg:text-6xl">
            Conforme aux règles <span className="font-bold">de la profession.</span>
          </h2>
          <p className="self-end text-lg font-medium leading-relaxed text-white/75 lg:col-span-5">
            Chaque page est relue au regard de l'article 10 du Règlement
            intérieur national et du vade-mecum de la communication du Conseil
            national des barreaux. Vous validez tout avant la mise en ligne.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
          {VERIFICATIONS.map((v, i) => (
            <motion.article
              key={v.titre}
              className="rounded-[1.75rem] bg-white/[0.07] p-7"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.06, ease: EASE }}
            >
              <h3 className="text-xl font-normal tracking-tight text-white">{v.titre}</h3>
              <p className="mt-3 text-[15px] font-medium leading-relaxed text-white/70">{v.texte}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
