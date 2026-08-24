import type { Profile } from '../../types/database'

const SIZES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

interface AvatarProps {
  profile?: Profile | null
  size?: keyof typeof SIZES
  showName?: boolean
  className?: string
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

export default function Avatar({ profile, size = 'sm', showName = false, className = '' }: AvatarProps) {
  if (!profile) {
    return (
      <span
        className={`${SIZES[size]} rounded-full bg-gray-800 border border-dashed border-gray-600 text-gray-500 flex items-center justify-center flex-shrink-0 ${className}`}
        title="Non assignée"
      >
        ?
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`${SIZES[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 text-white`}
        style={{ backgroundColor: profile.color || '#3B82F6' }}
        title={profile.full_name}
      >
        {initials(profile.full_name)}
      </span>
      {showName && <span className="text-xs text-gray-300 truncate">{profile.full_name}</span>}
    </span>
  )
}
