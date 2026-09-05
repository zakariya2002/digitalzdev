import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { isWebGLAvailable } from '../webgl/core'
import { Marquee, SplitText } from './motion'
import { EASE_OUT } from './motion/config'

// three.js ne part au réseau que si le décor est réellement affiché.
const HeroScene = lazy(() => import('../webgl/HeroScene'))

const KEYWORDS = [
  'E-COMMERCE',
  'SHOPIFY',
  'NEXT.JS',
  'DESIGN SYSTEM',
  'WEBGL',
  'DASHBOARD',
  'IDENTITÉ',
  'PERFORMANCE',
  'SEO',
  'CONVERSION',
]

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const [webgl, setWebgl] = useState(false)

  useEffect(() => setWebgl(isWebGLAvailable()), [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const contentOpacity = useTransform(scrollYProgress, [0, 0.35, 0.6], [1, 1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.6], ['0%', '-18%'])
  const marqueeOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  return (
    <section ref={containerRef} className="relative h-[190vh] bg-surface">
      <div className="sticky top-0 h-screen overflow-hidden bg-surface">
        {/* Décor : sphère WebGL. Sur desktop elle occupe la moitié droite pour
            laisser la typographie respirer ; en dessous, elle passe derrière le
            texte et le voile prend le relais pour le contraste. */}
        {webgl ? (
          <Suspense fallback={null}>
            <HeroScene className="absolute inset-0 opacity-40 lg:left-[42%] lg:right-[-6%] lg:opacity-100" />
          </Suspense>
        ) : (
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 lg:left-[72%]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgb(var(--accent)), transparent 68%)',
              filter: 'blur(40px)',
            }}
          />
        )}

        {/* Voile de contraste, inutile en desktop où le texte a sa propre colonne */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'radial-gradient(ellipse 78% 52% at 50% 48%, rgb(var(--surface) / 0.94) 0%, rgb(var(--surface) / 0.74) 55%, rgb(var(--surface) / 0.25) 85%)',
          }}
        />

        {/* Contenu */}
        <div className="relative z-10 flex h-full items-center">
          <motion.div
            className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center lg:items-start lg:text-left"
            style={{ opacity: contentOpacity, y: contentY }}
          >
            <h1 className="max-w-3xl font-display text-[13vw] font-bold leading-[0.88] tracking-tight sm:text-[9vw] lg:text-[6.4vw]">
              <SplitText
                as="span"
                by="char"
                immediate
                text="Digitalz Dev"
                delay={0.15}
                className="block text-text-primary"
              />
              <SplitText
                as="span"
                by="char"
                immediate
                text="agence web"
                delay={0.45}
                className="block text-accent"
              />
            </h1>

            <motion.p
              className="mt-8 max-w-md text-base leading-relaxed text-text-secondary md:text-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9, ease: EASE_OUT }}
            >
              Sites vitrines, boutiques Shopify et plateformes métier. Conçus,
              développés et suivis d'un bout à l'autre, par deux personnes.
            </motion.p>

          </motion.div>
        </div>

        {/* Bandeau de mots-clés, dont la vitesse suit le scroll */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 z-10"
          style={{ opacity: marqueeOpacity }}
        >
          <Marquee
            items={KEYWORDS}
            speed={28}
            className="border-y border-surface-border/60 bg-surface/40 py-3 font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-text-muted backdrop-blur-sm"
          />
        </motion.div>
      </div>
    </section>
  )
}
