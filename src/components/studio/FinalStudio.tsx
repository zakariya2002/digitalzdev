import { useRef, useState } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
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
    <section ref={ref} className="overflow-hidden bg-surface px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.25em] text-text-muted">Notre engagement</p>
        <h2 className="mt-8 text-center text-[9vw] uppercase leading-[1.02] text-text-primary md:text-[6.4vw] lg:text-[min(6vw,112px)]">
          <motion.span className="block" style={{ x: ligne1 }}>
            Nous vendons plus qu'un site.
          </motion.span>
          <motion.span className="block text-accent" style={{ x: ligne2 }}>
            Nous vendons des appels.
          </motion.span>
        </h2>

        <div className="mt-12 flex flex-col items-center gap-10 text-center md:mt-16">
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
              className="flex h-40 w-40 items-center justify-center rounded-full bg-accent p-6 text-center text-lg font-normal leading-tight text-surface transition-colors hover:bg-accent-hover md:h-52 md:w-52 md:text-xl"
            >
              Réserver un call
            </motion.button>
            <a
              href={WHATSAPP_PROJET}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center text-base font-medium text-text-primary transition-colors hover:text-accent"
            >
              ou WhatsApp ↗
            </a>
          </div>
        </div>
      </div>

      <CalendlyModal open={rdvOuvert} onClose={() => setRdvOuvert(false)} />
    </section>
  )
}
