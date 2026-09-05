import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import { projects } from '../data/projects'
import ContactForm from '../components/ContactForm'
import Footer from '../components/Footer'
import { Counter, Magnetic, Marquee, Parallax, Reveal, SplitText } from '../components/motion'
import { EASE_OUT, VIEWPORT } from '../components/motion/config'

/* ------------------------------------------------------------------ */

/**
 * Taille du titre selon sa longueur.
 *
 * Les titres sont des noms de domaine : « DRIVE » et
 * « lissage-sur-mesure.com » ne peuvent pas partager la même échelle sans que
 * le second déborde ou que le premier paraisse timide.
 */
function titleScale(title: string) {
  if (title.length > 19) return 'text-[9.5vw] md:text-[5.4vw]'
  if (title.length > 15) return 'text-[11vw] md:text-[6.6vw]'
  if (title.length > 10) return 'text-[12.5vw] md:text-[7.6vw]'
  return 'text-[14vw] md:text-[9vw]'
}

function BrowserFrame({
  url,
  image,
  gradient,
  tall = false,
  label,
}: {
  url: string
  image: string
  gradient: string
  tall?: boolean
  label?: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-xl shadow-black/5 md:rounded-2xl">
      <div className="flex items-center gap-1.5 border-b border-surface-border bg-surface-light px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF6058]" />
        <span className="h-3 w-3 rounded-full bg-[#FFBF2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28CA42]" />
        <span className="ml-3 flex h-7 flex-1 items-center rounded-md bg-surface-card px-3">
          <span className="truncate font-mono text-[11px] text-text-muted">
            {label ?? url}
          </span>
        </span>
      </div>
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${
          tall ? 'h-64 md:h-[520px]' : 'h-48 md:h-72'
        }`}
      >
        {/* Le zoom lent pendant le scroll donne du relief à une capture fixe */}
        <Parallax speed={0.05} zoom className="absolute inset-0">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        </Parallax>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function NextProject({ current }: { current: Project }) {
  const index = projects.findIndex((p) => p.id === current.id)
  const next = projects[(index + 1) % projects.length]

  return (
    <section className="border-t border-surface-border bg-surface">
      <Link to={next.route} className="group block">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
              Projet suivant
            </span>
          </Reveal>

          <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <SplitText
              as="h2"
              by="char"
              text={next.title}
              className={`block font-display font-bold tracking-tight text-text-primary transition-colors group-hover:text-accent ${
                next.title.length > 19
                  ? 'text-3xl md:text-5xl'
                  : 'text-4xl md:text-7xl'
              }`}
            />

            <Reveal from="right" delay={0.15}>
              {/* Vignette qui se dévoile au survol du bloc entier */}
              <div className="h-28 w-44 overflow-hidden rounded-xl opacity-0 transition-all duration-500 group-hover:opacity-100 md:h-32 md:w-56 md:translate-x-4 md:group-hover:translate-x-0">
                <img
                  src={next.heroImage}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </Reveal>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-text-secondary">
            <span>{next.subtitle}</span>
            <span className="text-text-muted transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}

/* ------------------------------------------------------------------ */

interface Props {
  project: Project
}

export default function ProjectPage({ project }: Props) {
  const heroRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    restDelta: 0.001,
  })

  const imageY = useTransform(smooth, [0, 1], ['0%', '22%'])
  const imageScale = useTransform(smooth, [0, 1], [1, 1.15])
  const contentY = useTransform(smooth, [0, 1], ['0%', '-40%'])
  const contentOpacity = useTransform(smooth, [0, 0.75], [1, 0])
  const overlayOpacity = useTransform(smooth, [0, 1], [1, 1.4])

  return (
    <main className="bg-surface">
      {/* ---------------------------------------------------------- */}
      {/* Hero parallaxe                                              */}
      {/* ---------------------------------------------------------- */}
      <section
        ref={heroRef}
        className="relative h-[88vh] overflow-hidden bg-surface md:h-screen"
      >
        <motion.div
          className="absolute inset-x-0 -top-[8%] h-[118%]"
          style={{ y: imageY, scale: imageScale }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} />
          <img
            src={project.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </motion.div>

        <motion.div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-surface from-20% via-surface/85 via-58% to-surface/20"
          style={{ opacity: overlayOpacity }}
        />

        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 px-6 pb-14 md:px-14 md:pb-20"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Link
                to="/#projets"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-accent"
              >
                <span className="transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                Retour aux projets
              </Link>
            </motion.div>

            <motion.div
              className="mt-6 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-card/80 px-4 py-2 backdrop-blur-sm">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">
                  {project.subtitle}
                </span>
              </span>
              <span className="font-mono text-xs text-text-muted">
                {project.year}
              </span>
            </motion.div>

            <SplitText
              as="h1"
              by="char"
              immediate
              text={project.title}
              delay={0.35}
              className={`mt-5 block font-display font-black leading-[0.92] tracking-tight text-text-primary ${titleScale(
                project.title
              )}`}
            />

            <motion.p
              className="mt-5 max-w-2xl text-lg font-medium text-text-secondary md:text-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: EASE_OUT }}
            >
              {project.description}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: EASE_OUT }}
            >
              <Magnetic>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-text-primary px-7 py-3 font-display text-sm font-semibold tracking-wider text-surface transition-opacity hover:opacity-90"
                >
                  VOIR LE SITE EN LIGNE
                  <span aria-hidden>↗</span>
                </a>
              </Magnetic>
              {project.access && (
                <span className="rounded-full border border-surface-border px-4 py-2 text-xs text-text-muted">
                  {project.access}
                </span>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Stack                                                       */}
      {/* ---------------------------------------------------------- */}
      <div className="border-y border-surface-border bg-surface-light py-4">
        <Marquee
          items={project.stack}
          speed={22}
          separator="/"
          className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-text-secondary"
        />
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Chiffres clés                                               */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-surface px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {project.metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: index * 0.1, ease: EASE_OUT }}
            >
              <Counter
                value={metric.value}
                className="block font-display text-4xl font-bold text-text-primary md:text-6xl"
              />
              <div className="mt-2 text-sm text-text-secondary">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Capture principale                                          */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-surface px-6 pb-16 md:pb-24">
        <Reveal scale duration={1.1} className="mx-auto max-w-5xl">
          <BrowserFrame
            url={project.url}
            image={project.heroImage}
            gradient={project.gradient}
            tall
          />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Brief et solution : l'intitulé reste collé pendant la lecture */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-surface px-6 py-16 md:py-28">
        <div className="mx-auto max-w-5xl space-y-20 md:space-y-32">
          {[
            { label: 'Le brief', title: 'Comprendre le besoin', body: project.brief },
            { label: 'La solution', title: 'Notre approche', body: project.solution },
          ].map((block) => (
            <div
              key={block.label}
              className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-16"
            >
              <div className="md:sticky md:top-32 md:h-fit">
                <Reveal>
                  <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                    {block.label}
                  </span>
                </Reveal>
              </div>
              <div>
                <SplitText
                  as="h2"
                  by="word"
                  text={block.title}
                  className="block font-display text-2xl font-bold tracking-tight text-text-primary md:text-4xl"
                />
                <Reveal delay={0.15}>
                  <p className="mt-6 text-base leading-relaxed text-text-secondary md:text-lg">
                    {block.body}
                  </p>
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Caractéristiques                                            */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-surface-light px-6 py-16 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <Reveal>
              <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Technique
              </span>
            </Reveal>
            <SplitText
              as="h2"
              by="word"
              text="Caractéristiques clés"
              delay={0.1}
              className="mt-4 block font-display text-2xl font-bold tracking-tight text-text-primary md:text-4xl"
            />
          </div>

          <ul>
            {project.features.map((feature, index) => (
              <motion.li
                key={feature}
                className="group flex items-baseline gap-4 border-t border-surface-border py-5 last:border-b"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.55, delay: index * 0.06, ease: EASE_OUT }}
              >
                <span aria-hidden className="text-accent">·</span>
                <span className="text-text-primary transition-transform duration-300 group-hover:translate-x-1 md:text-lg">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Écrans clés : alternance décalée                            */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-surface px-6 py-16 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <Reveal>
              <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Aperçus
              </span>
            </Reveal>
            <SplitText
              as="h2"
              by="word"
              text="Les écrans clés"
              delay={0.1}
              className="mt-4 block font-display text-2xl font-bold tracking-tight text-text-primary md:text-4xl"
            />
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:gap-10">
            {project.mockups.map((mockup, index) => (
              <Reveal
                key={mockup.title}
                delay={(index % 2) * 0.12}
                distance={70}
                duration={0.9}
                // Une colonne sur deux est décalée vers le bas : la grille
                // respire et l'œil ne lit plus deux rangées plates.
                className={index % 2 === 1 ? 'md:mt-16' : undefined}
              >
                <BrowserFrame
                  url={project.url}
                  label={mockup.title}
                  image={mockup.image}
                  gradient={mockup.gradient}
                />
                <p className="mt-4 text-sm text-text-secondary">{mockup.content}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <NextProject current={project} />
      <ContactForm />
      <Footer />
    </main>
  )
}
