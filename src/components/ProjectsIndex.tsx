import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import { EASE_OUT, VIEWPORT } from './motion/config'

interface Props {
  projects: Project[]
}

/**
 * Index des réalisations en liste.
 *
 * C'est la version servie quand le WebGL n'est pas disponible (mobile,
 * animations réduites, GPU absent) — et elle se tient toute seule : une ligne
 * par projet, la vignette se déplie au survol.
 */
export default function ProjectsIndex({ projects }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <ul className="mx-auto max-w-6xl px-6">
      {projects.map((project, index) => {
        const isHovered = hovered === project.id

        return (
          <motion.li
            key={project.id}
            className="border-t border-surface-border last:border-b"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, delay: index * 0.05, ease: EASE_OUT }}
            onMouseEnter={() => setHovered(project.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link
              to={project.route}
              className="group grid grid-cols-[auto_1fr] items-center gap-x-5 py-6 md:grid-cols-[auto_1fr_auto_auto] md:gap-x-10 md:py-8"
            >
              <span className="font-mono text-xs text-text-muted tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0">
                <h3 className="truncate font-display text-xl font-bold text-text-primary transition-colors group-hover:text-accent md:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-1 truncate text-sm text-text-secondary">
                  {project.subtitle}
                </p>
              </div>

              {/* Vignette révélée au survol, réservée au pointeur fin */}
              <div className="col-span-2 mt-4 md:col-span-1 md:mt-0">
                <div className="flex gap-2 md:hidden">
                  <img
                    src={project.heroImage}
                    alt=""
                    loading="lazy"
                    className="h-32 w-full rounded-lg object-cover object-top"
                  />
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="hidden gap-2 md:flex"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                    >
                      {project.mockups.slice(0, 3).map((mockup) => (
                        <img
                          key={mockup.title}
                          src={mockup.image}
                          alt=""
                          loading="lazy"
                          className="h-16 w-28 shrink-0 rounded-md object-cover object-top"
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="col-span-2 flex items-center gap-3 md:col-span-1">
                <div className="hidden gap-2 lg:flex">
                  {project.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-surface-border px-3 py-1 text-[11px] uppercase tracking-wider text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-xs text-text-muted tabular-nums">
                  {project.year}
                </span>
                <span className="text-text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </div>
            </Link>
          </motion.li>
        )
      })}
    </ul>
  )
}
