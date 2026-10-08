import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FACTS, MEMBERS, SERVICES as ROLES } from '../TeamSection'

const EASE = [0.22, 1, 0.36, 1] as const

/** Un chiffre qui défile jusqu'à sa valeur quand il entre à l'écran. */
function Chiffre({ valeur }: { valeur: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const vu = useInView(ref, { once: true, margin: '-60px' })
  const cible = parseInt(valeur, 10)
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!vu || Number.isNaN(cible)) return
    const debut = performance.now()
    let f = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - debut) / 1200)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * cible))
      if (p < 1) f = requestAnimationFrame(tick)
    }
    f = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(f)
  }, [vu, cible])

  return <span ref={ref}>{Number.isNaN(cible) ? valeur : n}</span>
}

/**
 * L'agence : les deux personnes, ce qu'elles prennent en charge, et les
 * chiffres tirés du portfolio.
 */
export default function EquipeStudio() {
  return (
    <section id="agence" className="bg-surface-light px-5 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-[9vw] text-text-primary md:text-5xl lg:text-6xl">
              Une équipe restreinte, <span className="text-citron">deux métiers complets.</span>
            </h2>
          </div>
          <p className="self-end text-lg font-medium leading-relaxed text-text-secondary lg:col-span-5">
            Pas de chaîne d'intermédiaires : vous parlez directement aux deux
            personnes qui conçoivent et qui développent. Et le travail ne
            s'arrête pas à la mise en ligne : nous mettons aussi en place et
            pilotons vos campagnes Meta Ads et Google Ads.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:mt-24 md:grid-cols-2">
          {MEMBERS.map((m, i) => (
            <motion.article
              key={m.name}
              className="flex flex-col rounded-[1.75rem] bg-surface-card p-8 md:p-10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-citron text-xl font-normal text-[#1d1d1f]">
                  {m.initials}
                </span>
                <div>
                  <h3 className="text-2xl font-normal tracking-tight text-text-primary md:text-3xl">{m.name}</h3>
                  <p className="text-sm font-medium text-accent">{m.role}</p>
                </div>
              </div>
              <p className="mt-6 flex-1 text-[15px] font-medium leading-relaxed text-text-secondary">{m.pitch}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {m.disciplines.map((d) => (
                  <li key={d} className="rounded-full bg-surface-light px-3 py-1.5 text-xs font-medium text-text-secondary">
                    {d}
                  </li>
                ))}
              </ul>
              <a
                href={m.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-[44px] w-fit items-center text-sm font-medium text-text-primary transition-colors hover:text-accent"
              >
                Profil LinkedIn ↗
              </a>
            </motion.article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.title}
              className="rounded-[1.75rem] bg-surface-card p-7"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
            >
              <h3 className="text-lg font-normal text-text-primary">{r.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-text-secondary">{r.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 md:mt-24">
          {FACTS.map((f) => (
            <div key={f.label} className="text-center">
              <p className="text-[13vw] font-extrabold leading-none tracking-[-0.04em] text-pop md:text-[6vw] lg:text-[min(6vw,104px)]">
                <Chiffre valeur={f.value} />
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-text-secondary md:text-sm">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
