import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Magnetic, SplitText } from './motion'
import { EASE_OUT } from './motion/config'
import HeroVideo from './HeroVideo'

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const contentOpacity = useTransform(scrollYProgress, [0, 0.35, 0.6], [1, 1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.6], ['0%', '-18%'])

  // L'épinglage et le fondu au défilement sont réservés à l'ordinateur. Sur
  // mobile, la section faisait presque deux écrans de haut et son contenu
  // s'effaçait dès le premier geste : on faisait défiler un écran entier de
  // vide avant d'atteindre les réalisations.
  const [grandEcran, setGrandEcran] = useState(false)
  useEffect(() => {
    const requete = window.matchMedia('(min-width: 1024px)')
    const suivre = () => setGrandEcran(requete.matches)
    suivre()
    requete.addEventListener('change', suivre)
    return () => requete.removeEventListener('change', suivre)
  }, [])

  return (
    <section ref={containerRef} className="relative bg-surface lg:h-[190vh]">
      {/* Sur ordinateur, la section reste épinglée et s'efface au défilement ;
          sur mobile, elle suit le flux : le texte, puis la vidéo dessous. */}
      <div className="pb-14 pt-28 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:overflow-hidden lg:py-0">
        <motion.div
          className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-14"
          style={grandEcran ? { opacity: contentOpacity, y: contentY } : undefined}
        >
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Le corps suit la largeur de fenêtre, mais il est plafonné :
                « Digitalz Dev » mesure environ 6,15 fois le corps ; au-delà de
                118 px il dépasserait `max-w-3xl` (768 px) et se couperait en
                quatre lignes au lieu de deux (constaté à 2560 px). */}
            <h1 className="max-w-3xl font-display text-[13vw] font-bold leading-[0.88] tracking-tight sm:text-[9vw] lg:text-[min(5.2vw,100px)]">
              <SplitText
                as="span"
                by="char"
                immediate
                text="Digitalz Dev"
                delay={0.15}
                className="block text-text-primary"
              />
              <SplitText
                as="span"
                by="char"
                immediate
                text="agence web."
                delay={0.45}
                className="block text-accent"
              />
            </h1>

            <motion.p
              className="mt-8 max-w-md text-base leading-relaxed text-text-secondary md:text-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9, ease: EASE_OUT }}
            >
              Sites vitrines, boutiques Shopify et plateformes métier. Conçus,
              développés, puis portés par vos campagnes Meta Ads et Google Ads.
            </motion.p>

            {/* Seule sortie au-dessus de la ligne de flottaison.
                Le haut de page n'en avait aucune : il fallait viser le
                « Démarrer » de la barre, dont le libellé ne promet rien, ou
                défiler deux écrans avant de croiser un lien. Le libellé est
                celui du pied de page, qui dit ce qu'on obtient. */}
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.1, ease: EASE_OUT }}
            >
              <Magnetic className="inline-block">
                <a
                  href="https://quiz.digitalzdev.com"
                  className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-accent px-8 font-display text-sm font-semibold tracking-wider text-surface transition-opacity hover:opacity-90"
                >
                  GÉNÉRER MA DÉMO GRATUITE
                </a>
              </Magnetic>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.7, ease: EASE_OUT }}
          >
            <HeroVideo />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
