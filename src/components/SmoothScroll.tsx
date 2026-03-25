import { useEffect } from 'react'
import Lenis from 'lenis'

interface Props {
  children: React.ReactNode
}

export default function SmoothScroll({ children }: Props) {
  useEffect(() => {
    // Disable smooth scroll on mobile/touch devices for native feel
    const isMobile = window.matchMedia('(max-width: 768px)').matches
      || 'ontouchstart' in window
    if (isMobile) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    ;(window as unknown as Record<string, unknown>).__lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      ;(window as unknown as Record<string, unknown>).__lenis = null
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
