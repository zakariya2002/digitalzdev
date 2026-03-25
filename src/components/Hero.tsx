import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const WORDS = [
  { text: 'E-COMMERCE', x: -32, y: -22, z: 400, size: '3rem', isGold: true },
  { text: 'PRO', x: 28, y: 25, z: 300, size: '4rem', isGold: false },
  { text: 'WEB', x: -25, y: 35, z: 350, size: '3.5rem', isGold: false },
  { text: 'AGENCE', x: 38, y: -20, z: 250, size: '2.5rem', isGold: true },
  { text: 'DESIGN', x: -42, y: -15, z: 0, size: '4rem', isGold: true },
  { text: 'RESPONSIVE', x: 35, y: -30, z: -100, size: '2rem', isGold: false },
  { text: 'CRÉATIF', x: -22, y: 40, z: -200, size: '2.5rem', isGold: false },
  { text: 'UX/UI', x: 42, y: 18, z: -50, size: '3.5rem', isGold: true },
  { text: 'PREMIUM', x: -38, y: 25, z: -150, size: '3rem', isGold: false },
  { text: 'BRANDING', x: 30, y: 38, z: -400, size: '2rem', isGold: false },
  { text: 'CONVERSION', x: -28, y: -38, z: -500, size: '2.5rem', isGold: true },
  { text: 'PIXEL', x: 42, y: -22, z: -350, size: '1.75rem', isGold: false },
  { text: 'IDENTITÉ', x: -44, y: 20, z: -450, size: '2rem', isGold: true },
  { text: 'STRATÉGIE', x: 25, y: -40, z: -600, size: '2.5rem', isGold: false },
  { text: 'MODERNE', x: -22, y: 44, z: -550, size: '2rem', isGold: true },
  { text: 'TYPOGRAPHIE', x: -40, y: -30, z: -800, size: '1.75rem', isGold: false },
  { text: 'INNOVATION', x: 38, y: 25, z: -900, size: '2rem', isGold: true },
  { text: 'PERFORMANCE', x: -25, y: 38, z: -750, size: '1.75rem', isGold: false },
  { text: 'MOBILE', x: 30, y: -35, z: -850, size: '2.5rem', isGold: true },
  { text: 'REACT', x: -44, y: 18, z: -1000, size: '2rem', isGold: false },
  { text: 'EXPÉRIENCE', x: 20, y: 42, z: -950, size: '1.75rem', isGold: true },
  { text: 'SCALABLE', x: -32, y: -42, z: -1200, size: '1.5rem', isGold: false },
  { text: 'AGILE', x: 40, y: 20, z: -1400, size: '1.75rem', isGold: true },
  { text: 'INTERFACE', x: -38, y: 30, z: -1300, size: '1.5rem', isGold: false },
  { text: 'ÉLÉGANT', x: 28, y: -38, z: -1500, size: '1.75rem', isGold: true },
  { text: 'OPTIMISÉ', x: -30, y: -28, z: -1600, size: '1.5rem', isGold: false },
  { text: 'RAPIDE', x: 35, y: -25, z: -1800, size: '2rem', isGold: true },
  { text: 'DÉVELOPPEMENT', x: -40, y: 18, z: -2000, size: '1.25rem', isGold: false },
  { text: 'FULL-STACK', x: 22, y: 40, z: -2200, size: '1.5rem', isGold: true },
  { text: 'DIGITAL', x: -28, y: -35, z: -2400, size: '2rem', isGold: false },
]

// Fewer words for mobile (no 3D, just decorative)
const WORDS_MOBILE = WORDS.slice(0, 14)

const getOpacity = (z: number) => {
  if (z > 200) return 0.13
  if (z > -200) return 0.11
  if (z > -600) return 0.09
  if (z > -1000) return 0.07
  if (z > -1500) return 0.05
  return 0.04
}

export default function Hero() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const z = useTransform(scrollYProgress, [0, 0.9], [0, 3500])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.15, 0.35], [1, 1, 0])
  const contentScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.92])
  const mobileWordsOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.5, 0])
  const mobileWordsScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.3])

  const scrollToProjects = () => {
    document.getElementById('projets')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={containerRef} className="h-[200vh] relative bg-surface">
      <div className="sticky top-0 h-screen bg-surface">

        {/* 3D Word Cloud — DESKTOP ONLY (GPU-heavy) */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{ perspective: 800, perspectiveOrigin: '50% 50%' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ z, transformStyle: 'preserve-3d' }}
          >
            {WORDS.map((word, i) => (
              <div
                key={i}
                className="absolute font-display font-bold whitespace-nowrap select-none"
                style={{
                  left: `${50 + word.x}%`,
                  top: `${50 + word.y}%`,
                  transform: `translate(-50%, -50%) translateZ(${word.z}px)`,
                  fontSize: word.size,
                  color: word.isGold
                    ? 'rgb(var(--accent))'
                    : 'rgb(var(--text-primary))',
                  opacity: getOpacity(word.z),
                  backfaceVisibility: 'hidden',
                }}
              >
                {word.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Simple 2D words — MOBILE ONLY (lightweight) */}
        <motion.div
          className="absolute inset-0 md:hidden overflow-hidden"
          style={{ opacity: mobileWordsOpacity, scale: mobileWordsScale }}
        >
          {WORDS_MOBILE.map((word, i) => (
            <div
              key={i}
              className="absolute font-display font-bold whitespace-nowrap select-none"
              style={{
                left: `${50 + word.x}%`,
                top: `${50 + word.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `calc(${word.size} * 0.7)`,
                color: word.isGold
                  ? 'rgb(var(--accent))'
                  : 'rgb(var(--text-primary))',
                opacity: getOpacity(word.z),
              }}
            >
              {word.text}
            </div>
          ))}
        </motion.div>

        {/* Center Hero Content */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ opacity: contentOpacity, scale: contentScale }}
        >
          {/* Glow - separate for mobile/desktop */}
          <div
            className="absolute w-[350px] h-[350px] rounded-full bg-surface md:hidden"
            style={{ filter: 'blur(50px)', opacity: 0.95 }}
          />
          <div
            className="absolute hidden md:block w-[800px] h-[800px] rounded-full bg-surface"
            style={{ filter: 'blur(100px)', opacity: 0.95 }}
          />

          <div className="relative text-center px-6 pointer-events-auto">
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <img
                src="/logo.png"
                alt="Digitalz Dev"
                className="w-28 h-28 md:w-36 md:h-36 rounded-full shadow-lg shadow-black/10"
              />
            </motion.div>

            <motion.h1
              className="font-display font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-text-primary">Digitalz Dev</span>
              <br />
              <span className="text-accent">Sites web qui convertissent</span>
            </motion.h1>

            <motion.p
              className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              E-commerce, dashboards santé, portfolios premium
            </motion.p>

            <motion.button
              onClick={scrollToProjects}
              className="px-8 py-4 bg-text-primary text-surface rounded-full font-display font-semibold tracking-wider text-sm hover:opacity-90 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              VOIR LES PROJETS
              <motion.span
                className="inline-block ml-2"
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                ↓
              </motion.span>
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          style={{ opacity: contentOpacity }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-text-muted rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1 h-2 bg-text-secondary rounded-full"
              animate={{ opacity: [1, 0], y: [0, 12] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
