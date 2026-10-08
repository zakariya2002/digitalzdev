import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { projects } from '../../data/projects'


function CarteProjet({ projet, className = '' }: { projet: (typeof projects)[number]; className?: string }) {
  return (
    <Link
      to={projet.route}
      data-curseur="Voir"
      className={`group block shrink-0 ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-card md:aspect-[16/10] lg:aspect-auto lg:h-[calc(100svh-14rem)]">
        <img
          src={projet.heroImage}
          alt={`Site ${projet.title}`}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-normal tracking-tight text-text-primary md:text-2xl">
            {projet.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-text-secondary md:text-base">{projet.subtitle}</p>
        </div>
        <span className="mt-2 shrink-0 rounded-full bg-surface-card px-3 py-1 text-xs font-medium text-text-secondary">
          {projet.year}
        </span>
      </div>
    </Link>
  )
}

/**
 * Tous les projets, en défilement horizontal épinglé sur ordinateur. La
 * hauteur de la section égale la course horizontale : chaque pixel de
 * défilement fait avancer la piste, sans temps mort avant ni après.
 */
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
  // Pas de ressort : Lenis lisse déjà le défilement, un second lissage
  // faisait traîner la piste derrière le scroll puis glisser après coup.
  const x = useTransform(scrollYProgress, [0, 1], [0, -course])

  return (
    <>
      {/* Ordinateur : la piste glisse vers la gauche pendant qu'on descend */}
      <section
        ref={sectionRef}
        className="relative hidden lg:block"
        style={{ height: `calc(100vh + ${course}px)` }}
      >
        <div className="sticky top-0 flex h-screen flex-col justify-start overflow-hidden pt-24">
          <motion.div ref={pisteRef} className="flex gap-8 px-10 will-change-transform" style={{ x }}>
            {projects.map((p) => (
              <CarteProjet key={p.id} projet={p} className="w-[46vw]" />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile et tablette : carrousel natif */}
      <section className="pb-6 pt-24 lg:hidden">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
          {projects.map((p) => (
            <CarteProjet key={p.id} projet={p} className="w-[82vw] snap-center sm:w-[60vw]" />
          ))}
        </div>
      </section>
    </>
  )
}

export default function TravauxStudio() {
  return (
    <div id="projets">
      <Selection />
    </div>
  )
}
