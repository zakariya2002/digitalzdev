import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Dernière section de la page formulaire : où que soit la souris, un bouton
 * « Voir notre site » la suit, et un clic n'importe où dans la section mène à
 * la page d'accueil. Sur écran tactile, le bouton reste au centre.
 */
export default function VoirSite() {
  const ref = useRef<HTMLAnchorElement>(null)
  const [dedans, setDedans] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 28, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 300, damping: 28, mass: 0.5 })

  const bouger = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set(e.clientX - r.left - r.width / 2)
    y.set(e.clientY - r.top - r.height / 2)
    setDedans(true)
  }
  const sortir = () => {
    setDedans(false)
    x.set(0)
    y.set(0)
  }

  return (
    <a
      ref={ref}
      href="/"
      onPointerMove={bouger}
      onPointerLeave={sortir}
      className="relative flex h-[70svh] min-h-[420px] items-center justify-center overflow-hidden bg-[#1d1d1f] md:cursor-none"
    >
      <p
        aria-hidden
        className="pointer-events-none select-none px-5 text-center text-[13vw] font-extrabold uppercase leading-[0.95] tracking-tight text-white/10 md:text-[9vw]"
      >
        Digitalz Dev
      </p>
      <motion.span
        style={{ x: sx, y: sy }}
        animate={{ scale: dedans ? 1.05 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="pointer-events-none absolute flex h-36 w-36 items-center justify-center rounded-full bg-pop text-center text-lg font-semibold leading-tight text-white shadow-[0_20px_50px_-15px_rgba(54,84,244,0.7)] md:h-44 md:w-44 md:text-xl"
      >
        Voir notre site
      </motion.span>
    </a>
  )
}
