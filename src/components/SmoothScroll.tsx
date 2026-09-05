import { useEffect } from 'react'
import { initSmoothScroll } from '../lib/scroll'

interface Props {
  children: React.ReactNode
}

/**
 * Monte le scroll lissé pour toute la vitrine et alimente l'état de scroll
 * partagé que lisent les scènes WebGL et les bandeaux défilants.
 */
export default function SmoothScroll({ children }: Props) {
  useEffect(() => initSmoothScroll(), [])

  return <>{children}</>
}
