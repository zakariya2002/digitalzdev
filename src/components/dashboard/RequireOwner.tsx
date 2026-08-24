import type { ReactNode } from 'react'
import { useTeam } from '../../contexts/TeamContext'

/** Certaines données ne concernent que le titulaire de l'entreprise. */
export default function RequireOwner({ children }: { children: ReactNode }) {
  const { isOwner, loading } = useTeam()

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto text-center bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-lg font-semibold text-white mb-2">Espace réservé</h2>
          <p className="text-sm text-gray-400">
            Cette section contient la comptabilité personnelle de l'entreprise.
            Le chiffre d'affaires par projet reste accessible depuis les fiches projet.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
