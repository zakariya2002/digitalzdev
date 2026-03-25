import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import ContactForm from '../components/ContactForm'
import Footer from '../components/Footer'

function MockupBrowser({
  mockup,
  index,
}: {
  mockup: Project['mockups'][0]
  index: number
}) {
  return (
    <motion.div
      className="rounded-xl overflow-hidden border border-surface-border bg-surface-card"
      initial={{ opacity: 0, y: 60, rotate: index % 2 === 0 ? -2 : 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="flex items-center gap-1.5 px-4 py-3 bg-surface-light border-b border-surface-border">
        <div className="w-3 h-3 rounded-full bg-[#FF6058]" />
        <div className="w-3 h-3 rounded-full bg-[#FFBF2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28CA42]" />
        <div className="ml-3 flex-1 h-6 bg-surface-card rounded-md flex items-center px-3">
          <span className="text-[11px] text-text-muted font-mono">
            {mockup.title}
          </span>
        </div>
      </div>
      <div className={`relative h-48 md:h-64 bg-gradient-to-br ${mockup.gradient}`}>
        <img
          src={mockup.image}
          alt={mockup.title}
          className="absolute inset-0 w-full h-full object-cover object-top"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
    </motion.div>
  )
}

interface Props {
  project: Project
}

export default function ProjectPage({ project }: Props) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <main className="bg-surface">
      {/* Parallax Hero */}
      <section
        ref={heroRef}
        className="relative h-[85vh] md:h-screen overflow-hidden bg-surface"
      >
        {/* Parallax background image */}
        <motion.div
          className="absolute inset-x-0 -top-[10%] h-[120%]"
          style={{ y: imageY }}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`}
          />
          <img
            src={project.heroImage}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover object-top"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </motion.div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface from-15% via-surface/70 via-50% to-surface/20" />

        {/* Content at bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 px-6 pb-12 md:px-16 md:pb-20 z-10"
          style={{ opacity: heroOpacity }}
        >
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-text-primary font-semibold hover:text-accent transition-colors text-sm mb-6"
              >
                <span>←</span> Retour aux projets
              </Link>
            </motion.div>

            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card/80 backdrop-blur-sm border border-surface-border mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-xs font-display font-semibold tracking-[0.15em] text-text-secondary uppercase">
                {project.subtitle}
              </span>
            </motion.div>

            <motion.h1
              className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-text-primary mb-4 drop-shadow-sm"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {project.title}
            </motion.h1>

            <motion.p
              className="text-text-secondary text-lg md:text-xl max-w-2xl font-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {project.description}
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          style={{ opacity: heroOpacity }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-text-muted/50 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1 h-2 bg-text-secondary rounded-full"
              animate={{ opacity: [1, 0], y: [0, 12] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Main mockup browser */}
      <section className="py-16 md:py-24 px-6 bg-surface">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-2xl overflow-hidden border border-surface-border bg-surface-card shadow-xl shadow-black/10">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-surface-light border-b border-surface-border">
              <div className="w-3 h-3 rounded-full bg-[#FF6058]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBF2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28CA42]" />
              <div className="ml-3 flex-1 h-7 bg-surface-card rounded-md flex items-center px-3">
                <span className="text-xs text-text-muted font-mono">
                  {project.url}
                </span>
              </div>
            </div>
            <div className="relative">
              <div
                className={`h-64 md:h-[500px] bg-gradient-to-br ${project.gradient}`}
              />
              <img
                src={project.heroImage}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Brief & Solution */}
      <section className="py-16 md:py-24 px-6 bg-surface">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase">
              Le brief
            </span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-text-primary mt-4 mb-6">
              Comprendre le besoin
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {project.brief}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className="text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase">
              La solution
            </span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-text-primary mt-4 mb-6">
              Notre approche
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {project.solution}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-6 bg-surface-light">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase">
              Technique
            </span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-text-primary mt-4">
              Caractéristiques clés
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.features.map((feature, i) => (
              <motion.div
                key={feature}
                className="flex items-center gap-4 p-4 rounded-lg bg-surface-card border border-surface-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <span className="text-text-primary text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mockups gallery */}
      <section className="py-16 md:py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase">
              Aperçus
            </span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-text-primary mt-4">
              Les écrans clés
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.mockups.map((mockup, i) => (
              <MockupBrowser key={mockup.title} mockup={mockup} index={i} />
            ))}
          </div>
        </div>
      </section>

      <ContactForm />
      <Footer />
    </main>
  )
}
