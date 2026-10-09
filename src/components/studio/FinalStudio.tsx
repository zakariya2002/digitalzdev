import { useRef, useState } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import AppelEntrant from './AppelEntrant'
import CalendlyModal from '../CalendlyModal'
import { WHATSAPP_PROJET } from '../ServicesSection'

/**
 * L'appel final : la promesse en très grand, puis un bouton rond qui attire
 * le curseur et ouvre la prise de rendez-vous.
 */
export default function FinalStudio() {
  const ref = useRef<HTMLElement>(null)
  const boutonRef = useRef<HTMLButtonElement>(null)
  const [rdvOuvert, setRdvOuvert] = useState(false)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const ligne1 = useTransform(scrollYProgress, [0, 0.6], ['-12%', '0%'])
  const ligne2 = useTransform(scrollYProgress, [0, 0.6], ['12%', '0%'])

  // Bouton magnétique : il suit le curseur au tiers de la distance.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 150, damping: 15 })
  const sy = useSpring(my, { stiffness: 150, damping: 15 })
  const attirer = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !boutonRef.current) return
    const r = boutonRef.current.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.3)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  const relacher = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <section ref={ref} className="overflow-hidden bg-surface px-5 pb-8 pt-14 md:px-10 md:pb-10 md:pt-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-[8vw] font-extrabold uppercase leading-[1.04] text-text-primary md:text-[4.6vw] lg:text-[min(4.4vw,76px)]">
          <motion.span className="block" style={{ x: ligne1 }}>
            Nous vendons plus qu'un site.
          </motion.span>
          <motion.span className="block text-[#25D366]" style={{ x: ligne2 }}>
            Nous vendons des appels.
          </motion.span>
        </h2>

        {/* Le téléphone qui sonne puis décroche : la promesse, en image. */}
        <div className="mt-6 md:mt-10">
          <AppelEntrant />
        </div>

        <div className="mt-6 flex flex-col items-center gap-10 text-center md:mt-8">
          <p className="max-w-md text-xl leading-snug text-text-secondary md:text-2xl">
            Commandez le site qui vous apportera vos prochains prospects.
          </p>

          <div className="flex flex-col items-center gap-6" onPointerMove={attirer} onPointerLeave={relacher}>
            <motion.button
              ref={boutonRef}
              type="button"
              onClick={() => setRdvOuvert(true)}
              style={{ x: sx, y: sy }}
              whileTap={{ scale: 0.94 }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-[#25D366] p-3 text-center text-base font-normal leading-tight text-white transition-colors hover:bg-[#1ebe5a] md:h-40 md:w-40 md:p-6 md:text-lg"
            >
              Prendre un RDV
            </motion.button>
            {/* Pour qui préfère écrire plutôt que caler un appel. */}
            <a
              href={WHATSAPP_PROJET}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center text-base text-text-muted underline-offset-4 transition-colors hover:text-text-primary hover:underline"
            >
              Parlons-en sur WhatsApp
            </a>
          </div>
        </div>
      </div>

      <CalendlyModal open={rdvOuvert} onClose={() => setRdvOuvert(false)} />
    </section>
  )
}
