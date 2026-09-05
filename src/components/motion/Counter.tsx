import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface Props {
  /** Valeur brute : « 98 », « 100% », « <1.5s », « 30+ »… */
  value: string
  className?: string
  duration?: number
}

/**
 * Compteur qui s'incrémente à l'entrée dans le viewport.
 *
 * Les valeurs du portfolio ne sont pas toutes numériques (« <1.5s », « EU »,
 * « 360° »). On isole donc le nombre s'il y en a un, en conservant préfixe et
 * suffixe ; sinon la valeur s'affiche telle quelle.
 */
export default function Counter({ value, className, duration = 1.6 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reduced = useReducedMotion()

  const match = value.match(/^(\D*?)([\d.,]+)(.*)$/)
  const prefix = match?.[1] ?? ''
  const target = match ? parseFloat(match[2].replace(',', '.')) : null
  const suffix = match?.[3] ?? ''
  const decimals = match?.[2].includes('.') || match?.[2].includes(',') ? 1 : 0

  const [display, setDisplay] = useState(target === null || reduced ? null : 0)

  useEffect(() => {
    if (target === null || reduced || !inView) return

    let raf = 0
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1)
      // Expo out : le compteur ralentit franchement sur la fin.
      const eased = 1 - Math.pow(2, -10 * t)
      setDisplay(target * (t === 1 ? 1 : eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration, reduced])

  if (target === null || display === null) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    )
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tabular-nums">{display.toFixed(decimals)}</span>
      {suffix}
    </span>
  )
}
