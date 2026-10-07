import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { projects } from '../../data/projects'

const EASE = [0.22, 1, 0.36, 1] as const
const SELECTION = projects.slice(0, 5)

function CarteProjet({ projet, className = '' }: { projet: (typeof projects)[number]; className?: string }) {
  return (
    <Link
      to={projet.route}
      data-curseur="Voir"
      className={`group block shrink-0 ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-card md:aspect-[16/10]">
        <img
          src={projet.heroImage}
          alt={`Site ${projet.title}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-text-primary md:text-4xl">
            {projet.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-text-secondary md:text-base">{projet.subtitle}</p>
        </div>
        <span className="mt-2 shrink-0 rounded-full bg-surface-card px-3 py-1 text-xs font-bold text-text-secondary">
          {projet.year}
        </span>
      </div>
    </Link>
  )
}

/** Sélection de projets : défilement horizontal épinglé sur ordinateur. */
function Selection() {
  const sectionRef = useRef<HTMLElement>(null)
  const pisteRef = useRef<HTMLDivElement>(null)
  const [course, setCourse] = useState(0)

  useEffect(() => {
    const mesurer = () => {
      const piste = pisteRef.current
      if (piste) setCourse(Math.max(0, piste.scrollWidth - window.innerWidth))
    }
    mesurer()
    window.addEventListener('resize', mesurer)
    return () => window.removeEventListener('resize', mesurer)
  }, [])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const brut = useTransform(scrollYProgress, [0, 1], [0, -course])
  const x = useSpring(brut, { stiffness: 120, damping: 30, mass: 0.4 })
  const avance = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <>
      {/* Ordinateur : la piste glisse vers la gauche pendant qu'on descend */}
      <section ref={sectionRef} className="relative hidden h-[260vh] lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="mb-8 flex items-end justify-between px-10">
            <h2 className="text-[7vw] text-text-primary">
              Sélection<span className="text-accent">.</span>
            </h2>
            <div className="mb-4 w-64">
              <p className="text-right text-sm font-bold text-text-secondary">
                {projects.length} sites en ligne
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-card">
                <motion.div className="h-full rounded-full bg-accent" style={{ width: avance }} />
              </div>
            </div>
          </div>
          <motion.div ref={pisteRef} className="flex gap-8 px-10" style={{ x }}>
            {SELECTION.map((p) => (
              <CarteProjet key={p.id} projet={p} className="w-[46vw]" />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile et tablette : carrousel natif */}
      <section className="py-20 lg:hidden">
        <h2 className="px-5 text-[15vw] text-text-primary">
          Sélection<span className="text-accent">.</span>
        </h2>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
          {SELECTION.map((p) => (
            <CarteProjet key={p.id} projet={p} className="w-[82vw] snap-center sm:w-[60vw]" />
          ))}
        </div>
      </section>
    </>
  )
}

/** Index de tous les projets, avec aperçu qui suit le curseur. */
function Index() {
  const [survol, setSurvol] = useState<number | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 30 })
  const sy = useSpring(y, { stiffness: 300, damping: 30 })

  return (
    <section
      id="projets"
      className="relative px-5 pb-24 pt-10 md:px-10 md:pb-36"
      onPointerMove={(e) => {
        x.set(e.clientX)
        y.set(e.clientY)
      }}
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-text-muted">
          Toutes nos réalisations
        </p>
        <p className="mt-4 max-w-xl text-lg font-medium text-text-secondary">
          Des boutiques Shopify aux plateformes métier. Chaque projet part d'un
          problème concret et se juge sur ce qu'il change une fois en ligne.
        </p>
        <ul className="mt-12" onPointerLeave={() => setSurvol(null)}>
          {projects.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.05, ease: EASE }}
            >
              <Link
                to={p.route}
                data-curseur="Voir"
                onPointerEnter={() => setSurvol(i)}
                className="flex items-center gap-4 py-3 transition-opacity duration-300 md:py-4"
                style={{ opacity: survol === null || survol === i ? 1 : 0.35 }}
              >
                <img
                  src={p.heroImage}
                  alt=""
                  loading="lazy"
                  className="h-14 w-20 shrink-0 rounded-lg object-cover object-top md:hidden"
                />
                <span className="min-w-0 flex-1 truncate text-3xl font-black tracking-tight text-text-primary md:text-6xl lg:text-7xl">
                  {p.title}
                </span>
                <span className="hidden shrink-0 text-right text-sm font-semibold text-text-secondary md:block">
                  {p.subtitle}
                  <span className="block text-text-muted">{p.year}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* L'aperçu flottant, réservé au pointeur fin */}
      <AnimatePresence>
        {survol !== null && (
          <motion.div
            key="apercu"
            className="pointer-events-none fixed left-0 top-0 z-40 hidden h-64 w-80 overflow-hidden rounded-2xl [@media(hover:hover)]:md:block"
            style={{ x: sx, y: sy, translateX: '-50%', translateY: '-60%' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <img src={projects[survol].heroImage} alt="" className="h-full w-full object-cover object-top" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default function TravauxStudio() {
  return (
    <>
      <Selection />
      <Index />
    </>
  )
}
