import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Use Lenis scroll-to if available (immediate = no animation)
    const lenis = (window as unknown as Record<string, unknown>).__lenis
    if (lenis && typeof (lenis as { scrollTo: Function }).scrollTo === 'function') {
      ;(lenis as { scrollTo: Function }).scrollTo(0, { immediate: true })
    }
    // Also set native scroll as fallback
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
  }, [pathname])

  return null
}
