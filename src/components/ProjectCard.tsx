import { useState, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'

interface Props {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setHovered(false)
  }

  return (
    <motion.div
      className="group cursor-pointer"
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link to={project.route}>
        <motion.div
          ref={ref}
          className="relative rounded-2xl overflow-hidden bg-surface-card border border-surface-border"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Image preview */}
          <div
            className={`relative h-64 md:h-80 bg-gradient-to-br ${project.gradient} overflow-hidden`}
          >
            <img
              src={project.heroImage}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover object-top"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 bg-text-primary/20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="px-6 py-3 bg-surface/80 backdrop-blur-sm text-text-primary rounded-full text-sm font-display font-semibold tracking-wider">
                VOIR LE PROJET
              </span>
            </motion.div>
          </div>

          {/* Card text */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-xs font-display font-semibold tracking-[0.15em] text-text-secondary uppercase">
                {project.subtitle}
              </span>
            </div>
            <h3 className="font-display font-bold text-xl md:text-2xl text-text-primary mb-2">
              {project.title}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
              {project.description}
            </p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
