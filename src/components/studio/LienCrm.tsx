import { Link } from 'react-router-dom'

/** Renvoi vers le portfolio CRM, juste après les réalisations. */
export default function LienCrm() {
  return (
    <section className="bg-surface px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-[1.75rem] bg-surface-light p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-text-muted">CRM et back-offices</p>
          <p className="mt-2 text-2xl font-medium leading-snug text-text-primary md:text-3xl">
            Nous concevons aussi des CRM sur mesure : leads, appels, devis, factures et comptabilité réunis dans un seul outil.
          </p>
        </div>
        <Link
          to="/crm"
          className="inline-flex min-h-[56px] shrink-0 items-center rounded-full bg-accent px-8 text-base font-medium text-surface transition-colors hover:bg-accent-hover"
        >
          Voir nos CRM
        </Link>
      </div>
    </section>
  )
}
