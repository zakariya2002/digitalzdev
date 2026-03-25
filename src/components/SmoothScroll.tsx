import { useEffect } from 'react'
import Lenis from 'lenis'

interface Props {
  children: React.ReactNode
}

export default function SmoothScroll({ children }: Props) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    // Expose for ScrollToTop
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
