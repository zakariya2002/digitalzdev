/**
 * Logo AvocatLeads : un carré arrondi gris moyen qui porte un palais de
 * justice en blocs blancs, puis le nom en
 * minuscules, « avocat » en graisse légère et « leads » en gras.
 */

/** Le pictogramme seul : le palais de justice dans son carré gris. */
export function Pictogramme({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="10" fill="#9EA2AA" />
      {/* Le palais de justice : fronton, trois colonnes et emmarchement. */}
      <path d="M20 8.5l11.5 6.5h-23z" fill="#FFFFFF" />
      <rect x="10" y="17" width="3.6" height="11" rx="1" fill="#FFFFFF" />
      <rect x="18.2" y="17" width="3.6" height="11" rx="1" fill="#FFFFFF" />
      <rect x="26.4" y="17" width="3.6" height="11" rx="1" fill="#FFFFFF" />
      <rect x="8.5" y="29.5" width="23" height="2.6" rx="1.3" fill="#FFFFFF" />
    </svg>
  )
}

/** Le nom, « avocat » léger et « leads » gras. */
export function NomMarque({ className = '' }: { className?: string }) {
  return (
    <span className={`whitespace-nowrap tracking-[-0.03em] text-[#1D1D1F] ${className}`} style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
      <span className="font-light">avocat</span>
      <span className="font-bold">leads</span>
    </span>
  )
}

export default function Logo({ taille = 'normale' }: { taille?: 'normale' | 'grande' }) {
  const grande = taille === 'grande'
  return (
    <span className={`inline-flex items-center ${grande ? 'gap-4' : 'gap-2.5'}`}>
      <Pictogramme className={grande ? 'h-14 w-14' : 'h-8 w-8'} />
      <NomMarque className={grande ? 'text-[44px]' : 'text-[21px]'} />
    </span>
  )
}
