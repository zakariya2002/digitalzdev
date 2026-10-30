import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * La vidéo de présentation, en 16:9 sur ordinateur et en 9:16 sur téléphone.
 * Elle démarre sans le son, comme l'exigent les navigateurs pour la lecture
 * automatique ; les commandes permettent de l'activer.
 */
export default function Presentation() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    setMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  return (
    <section id="presentation" className="bg-surface px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[9vw] text-text-primary md:text-5xl lg:text-6xl">
          AvocatLeads <span className="font-bold text-pop">en 40 secondes.</span>
        </h2>
        <motion.video
          key={mobile ? 'mobile' : 'ordinateur'}
          className="mt-10 aspect-[9/16] w-full rounded-[1.75rem] bg-surface-card object-cover md:aspect-video"
          src={mobile ? '/videos/avocatleads-mobile.mp4' : '/videos/avocatleads.mp4'}
          poster={mobile ? '/videos/avocatleads-mobile-poster.jpg' : '/videos/avocatleads-poster.jpg'}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      </div>
    </section>
  )
}
