import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion'
import { WHATSAPP_PROJET } from '../ServicesSection'

const EASE = [0.22, 1, 0.36, 1] as const

/** Une ligne de titre qui monte depuis derrière son propre masque. */
function Ligne({ children, delai }: { children: ReactNode; delai: number }) {
  return (
    <span className="-mt-[0.18em] block overflow-hidden pb-[0.06em] pt-[0.18em]">
      <motion.span
        className="block"
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay: delai, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/**
 * Haut de page : le titre, puis la vidéo qui prend tout l'écran.
 *
 * La vidéo est posée en plein écran dès le départ, mais découpée en une
 * carte en bas de l'écran. En défilant, la section reste fixée le temps que
 * la découpe s'ouvre jusqu'aux bords et que le titre s'efface ; l'accroche de
 * la vidéo se joue alors en plein écran. Quelque chose est
 * toujours à l'écran : jamais de vide pendant l'animation.
 */
export default function HeroStudio() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [son, setSon] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const requete = window.matchMedia('(max-width: 767px)')
    const suivre = () => setMobile(requete.matches)
    suivre()
    requete.addEventListener('change', suivre)
    return () => requete.removeEventListener('change', suivre)
  }, [])

  // Lecture seulement quand la vidéo est à l'écran, et jamais seule si
  // l'appareil demande moins d'animations.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const obs = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? void video.play().catch(() => {}) : video.pause()),
      { threshold: 0.1 }
    )
    obs.observe(video)
    return () => obs.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Découpe de la vidéo : invisible au départ, elle monte du bas de l'écran
  // en carte dès qu'on défile, puis s'ouvre jusqu'au plein écran.
  const cote = mobile ? 5 : 18
  const haut = useTransform(scrollYProgress, [0, 0.02, 0.3, 0.7], [100, 100, mobile ? 40 : 34, 0])
  const droite = useTransform(scrollYProgress, [0, 0.3, 0.7], [cote, cote, 0])
  const bas = useTransform(scrollYProgress, [0, 0.3, 0.7], [4, 4, 0])
  const gauche = useTransform(scrollYProgress, [0, 0.3, 0.7], [cote, cote, 0])
  const rayon = useTransform(scrollYProgress, [0, 0.3, 0.7], [mobile ? 18 : 28, mobile ? 18 : 28, 0])
  const decoupe = useMotionTemplate`inset(${haut}% ${droite}% ${bas}% ${gauche}% round ${rayon}px)`
  const zoom = useTransform(scrollYProgress, [0, 0.7], [1.15, 1])
  const sonOpacite = useTransform(scrollYProgress, [0.08, 0.25], [0, 1])

  const titreOpacite = useTransform(scrollYProgress, [0.05, 0.3], [1, 0])
  const titreY = useTransform(scrollYProgress, [0, 0.4], ['0%', '-18%'])

  const basculerSon = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setSon(!video.muted)
    if (video.paused) void video.play().catch(() => {})
  }

  return (
    <section ref={sectionRef} className="relative h-[190vh] bg-surface md:h-[240vh]">
      <div
        className="sticky top-0 h-[100svh] overflow-hidden"
        // Fond dégradé gris clair, comme butter.video.
        style={{ background: 'linear-gradient(#d6d6d6 0%, #fafafa 100%)' }}
      >
        {/* La vidéo, découpée */}
        <motion.div className="absolute inset-0 z-20" style={{ clipPath: decoupe }}>
          <motion.video
            ref={videoRef}
            className="h-full w-full object-cover"
            style={{ scale: zoom }}
            // Version verticale sur mobile, horizontale ailleurs : la vidéo
            // finit en plein écran, elle doit épouser le format de l'écran.
            src={mobile ? '/videos/presentation-mobile.mp4' : '/videos/presentation.mp4'}
            poster={mobile ? '/videos/presentation-mobile-poster.jpg' : '/videos/presentation-poster.jpg'}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Vidéo de présentation de Digitalz Dev"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        </motion.div>

        {/* Le titre et le bouton, centrés au milieu de l'écran */}
        <motion.div
          className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center"
          style={{ opacity: titreOpacite, y: titreY, fontFamily: "'Inter Tight', system-ui, sans-serif" }}
        >
          {/* Trousseau 3D masqué pour l'instant : <Trousseau className="pointer-events-none absolute inset-0 -z-10" /> */}
          <h1 className="text-[11.5vw] leading-[1] tracking-[-0.02em] text-[#0f0f0f] md:text-[6.6vw] lg:text-[min(6.6vw,104px)]">
            <Ligne delai={0.25}>Créons un site</Ligne>
            <Ligne delai={0.35}>
              à la hauteur de votre <span className="text-pop">image.</span>
            </Ligne>
          </h1>

          <motion.a
            href={WHATSAPP_PROJET}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-[50px] items-center rounded-xl bg-[#0f0f0f] px-[38px] text-[16px] tracking-[0.01em] text-white transition-colors hover:bg-black md:mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
          >
            Prendre rendez-vous
          </motion.a>
        </motion.div>

        <motion.button
          type="button"
          style={{ opacity: sonOpacite }}
          onClick={basculerSon}
          aria-label={son ? 'Couper le son' : 'Activer le son'}
          className="absolute bottom-[6%] right-[8%] z-30 inline-flex min-h-[40px] items-center rounded-full bg-black/50 px-4 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/70 md:bottom-auto md:right-10 md:top-28"
        >
          {son ? 'Son activé' : 'Son coupé'}
        </motion.button>
      </div>

    </section>
  )
}
