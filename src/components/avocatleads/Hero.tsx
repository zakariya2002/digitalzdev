import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const EASE = [0.22, 1, 0.36, 1] as const

/** Une ligne de titre qui monte depuis derrière son propre masque. */
function Ligne({ children, delai }: { children: ReactNode; delai: number }) {
  return (
    <span className="-mt-[0.18em] block overflow-hidden pb-[0.06em] pt-[0.18em]">
      <motion.span
        className="block"
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay: delai, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/**
 * Haut de page d'AvocatLeads : le titre de la V1, centré sur son fond
 * dégradé, sans objet 3D ni vidéo. Le message porte seul.
 */
export default function Hero() {
  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 text-center"
      style={{ background: 'linear-gradient(#d9dadd 0%, #f7f7f8 100%)', fontFamily: "'Inter Tight', system-ui, sans-serif" }}
    >
      <motion.p
        className="mb-8 text-[13px] font-medium uppercase tracking-[0.22em] text-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.15 }}
      >
        Agence web dédiée aux avocats
      </motion.p>
      <h1 className="text-[11vw] leading-[1] tracking-[-0.02em] text-[#0f0f0f] md:text-[6.6vw] lg:text-[min(6.6vw,104px)]">
        <Ligne delai={0.25}>Le site qui amène</Ligne>
        <Ligne delai={0.35}>
          des clients à votre <span className="text-pop">cabinet.</span>
        </Ligne>
      </h1>
      <motion.p
        className="mt-8 max-w-xl text-lg leading-relaxed text-text-secondary md:text-xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
      >
        Sites de cabinet conformes aux règles de la profession, prise de
        rendez-vous en ligne et référencement local, pour les avocats.
      </motion.p>
      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
      >
        <Link
          to="/projet"
          className="inline-flex h-[50px] items-center rounded-xl bg-[#0f0f0f] px-[38px] text-[16px] tracking-[0.01em] text-white transition-colors hover:bg-black"
        >
          Prendre rendez-vous
        </Link>
      </motion.div>
    </section>
  )
}
