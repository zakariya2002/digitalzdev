import { useState } from 'react'
import { motion } from 'framer-motion'
import CalendlyModal from '../CalendlyModal'
import { WHATSAPP_PROJET } from '../ServicesSection'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Deux façons de nous joindre, juste après les réalisations.
 *
 * C'est le moment où le visiteur vient de voir ce qu'on fait : on lui laisse
 * le choix du canal plutôt que de l'envoyer au formulaire. Un créneau dans
 * l'agenda pour qui préfère un appel calé, WhatsApp pour qui préfère écrire.
 */
export default function RendezVousStudio() {
  const [rdvOuvert, setRdvOuvert] = useState(false)

  return (
    <section className="bg-surface py-24 md:py-32">
      <motion.div
        className="mx-auto flex max-w-4xl flex-col items-center px-5 text-center md:px-10"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <h2
          className="text-[10vw] leading-[1.02] tracking-[-0.03em] text-text-primary md:text-[5vw] lg:text-[min(4.6vw,76px)]"
          style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}
        >
          Parlons de votre <span className="text-pop">projet.</span>
        </h2>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-text-secondary md:text-lg">
          Réservez un appel de vingt minutes dans notre agenda, ou écrivez-nous
          directement sur WhatsApp. On répond dans la journée.
        </p>
        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => setRdvOuvert(true)}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-[#0f0f0f] px-8 text-[16px] tracking-[0.01em] text-white transition-colors hover:bg-black sm:w-auto"
          >
            Réserver un créneau
          </button>
          <a
            href={WHATSAPP_PROJET}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 text-[16px] tracking-[0.01em] text-white transition-colors hover:bg-[#1ebe5a] sm:w-auto"
          >
            Écrire sur WhatsApp
          </a>
        </div>
      </motion.div>

      <CalendlyModal open={rdvOuvert} onClose={() => setRdvOuvert(false)} />
    </section>
  )
}
