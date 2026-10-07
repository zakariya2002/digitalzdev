import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion'
import CalendlyModal from '../CalendlyModal'

const EASE = [0.22, 1, 0.36, 1] as const
const QUIZ = 'https://quiz.digitalzdev.com'

/** Une ligne de titre qui monte depuis derrière son propre masque. */
function Ligne({ children, delai }: { children: ReactNode; delai: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
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
 * l'aperçu gratuit vient alors se poser sur l'image. Quelque chose est
 * toujours à l'écran : jamais de vide pendant l'animation.
 */
export default function HeroStudio() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [rdvOuvert, setRdvOuvert] = useState(false)
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

  // Découpe de la vidéo : une carte en bas, puis le plein écran.
  const [haut0, droite0, bas0, gauche0] = mobile ? [67, 5, 4, 5] : [56, 4, 5, 50]
  const haut = useTransform(scrollYProgress, [0, 0.6], [haut0, 0])
  const droite = useTransform(scrollYProgress, [0, 0.6], [droite0, 0])
  const bas = useTransform(scrollYProgress, [0, 0.6], [bas0, 0])
  const gauche = useTransform(scrollYProgress, [0, 0.6], [gauche0, 0])
  const rayon = useTransform(scrollYProgress, [0, 0.6], [mobile ? 18 : 28, 0])
  const decoupe = useMotionTemplate`inset(${haut}% ${droite}% ${bas}% ${gauche}% round ${rayon}px)`
  const zoom = useTransform(scrollYProgress, [0, 0.6], [1.15, 1])

  const titreOpacite = useTransform(scrollYProgress, [0.05, 0.4], [1, 0])
  const titreY = useTransform(scrollYProgress, [0, 0.4], ['0%', '-12%'])
  const accrocheOpacite = useTransform(scrollYProgress, [0.62, 0.78], [0, 1])
  const accrocheY = useTransform(scrollYProgress, [0.62, 0.78], [40, 0])

  const basculerSon = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setSon(!video.muted)
    if (video.paused) void video.play().catch(() => {})
  }

  return (
    <section ref={sectionRef} className="relative h-[190vh] bg-surface md:h-[240vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* La vidéo, découpée */}
        <motion.div className="absolute inset-0" style={{ clipPath: decoupe }}>
          <motion.video
            ref={videoRef}
            className="h-full w-full object-cover"
            style={{ scale: zoom }}
            src="/videos/presentation.mp4"
            poster="/videos/presentation-poster.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Vidéo de présentation de Digitalz Dev"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        </motion.div>

        {/* Le titre, au-dessus de la carte vidéo */}
        <motion.div
          className="relative z-10 flex h-full flex-col justify-start px-5 pt-28 md:px-10 md:pt-32"
          style={{ opacity: titreOpacite, y: titreY }}
        >
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.25em] text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Agence web · Avocats, architectes, métiers de l'image
          </motion.p>
          <h1 className="mt-5 text-[12.5vw] text-text-primary md:text-[8.6vw] lg:text-[min(8.6vw,170px)]">
            <Ligne delai={0.25}>Des sites à la</Ligne>
            <Ligne delai={0.35}>hauteur de votre</Ligne>
            <Ligne delai={0.45}>
              <span className="text-accent">réputation.</span>
            </Ligne>
          </h1>

          <motion.div
            className="mt-6 max-w-sm md:absolute md:bottom-[7%] md:left-10 md:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          >
            <p className="hidden text-[15px] font-medium leading-relaxed text-text-secondary md:block">
              Cabinets d'avocats, agences d'architecture, photographes et
              vidéastes : nous concevons des sites sobres et rapides, qui
              inspirent confiance et font venir les bons clients.
            </p>
            <div className="flex flex-wrap gap-2 md:mt-5">
              <button
                type="button"
                onClick={() => setRdvOuvert(true)}
                className="inline-flex min-h-[46px] items-center rounded-full bg-accent px-5 text-sm font-extrabold text-surface transition-colors hover:bg-accent-hover md:min-h-[48px] md:px-6 md:text-[15px]"
              >
                Prendre rendez-vous
              </button>
              <a
                href={QUIZ}
                className="inline-flex min-h-[46px] items-center rounded-full bg-surface-card px-5 text-sm font-bold text-text-primary transition-colors hover:bg-surface-border md:min-h-[48px] md:px-6 md:text-[15px]"
              >
                Voir un aperçu
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* L'accroche, une fois la vidéo en plein écran */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-5 px-5 pb-10 md:flex-row md:items-end md:justify-between md:px-10 md:pb-14"
          style={{ opacity: accrocheOpacite, y: accrocheY }}
        >
          <h2 className="max-w-3xl text-5xl text-white md:text-7xl">
            Votre site à votre image.
            <span className="block text-accent">Un aperçu en 60 secondes.</span>
          </h2>
          <a
            href={QUIZ}
            data-curseur="Go"
            className="inline-flex min-h-[56px] w-fit items-center gap-2 rounded-full bg-accent px-8 text-base font-extrabold text-surface transition-colors hover:bg-accent-hover"
          >
            Voir mon aperçu →
          </a>
        </motion.div>

        <button
          type="button"
          onClick={basculerSon}
          aria-label={son ? 'Couper le son' : 'Activer le son'}
          className="absolute bottom-[6%] right-[8%] z-20 inline-flex min-h-[40px] items-center rounded-full bg-black/50 px-4 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-black/70 md:bottom-auto md:right-10 md:top-28"
        >
          {son ? 'Son activé' : 'Son coupé'}
        </button>
      </div>

      <CalendlyModal open={rdvOuvert} onClose={() => setRdvOuvert(false)} />
    </section>
  )
}
