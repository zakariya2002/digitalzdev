import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProjectCard from './ProjectCard'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'

function StackingCard({
  project,
  index,
  total,
}: {
  project: Project
  index: number
  total: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const isLast = index === total - 1
  const scale = useTransform(
    scrollYProgress,
    [0.3, 0.75],
    [1, isLast ? 1 : 0.92]
  )

  return (
    <div ref={ref} className="h-[50vh]">
      <div
        className="sticky px-6"
        style={{ top: `${100 + index * 40}px`, zIndex: total - index }}
      >
        <motion.div style={{ scale }} className="max-w-5xl mx-auto">
          <ProjectCard project={project} index={index} />
        </motion.div>
      </div>
    </div>
  )
}

export default function ProjectsSection() {
  return (
    <section id="projets" className="relative py-24 md:py-32 bg-surface overflow-hidden">
      {/* Section header */}
      <motion.div
        className="text-center mb-16 md:mb-24 px-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase">
          Portfolio
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl text-text-primary mt-4 mb-6">
          Nos réalisations
        </h2>
        <p className="text-text-secondary max-w-lg mx-auto mb-8">
          Chaque projet est une histoire unique. Découvrez comment nous
          transformons les visions en expériences digitales.
        </p>
        <Link
          to="/contact"
          className="inline-block px-8 py-3 bg-text-primary text-surface rounded-full font-display font-semibold tracking-wider text-sm hover:opacity-90 transition-all"
        >
          DEMANDER UN DEVIS
        </Link>
      </motion.div>

      {/* Desktop: Stacking cards */}
      <div className="hidden lg:block pb-[30vh]">
        {projects.map((project, i) => (
          <StackingCard
            key={project.id}
            project={project}
            index={i}
            total={projects.length}
          />
        ))}
      </div>

      {/* Mobile / Tablet: Grid */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto px-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  )
}
