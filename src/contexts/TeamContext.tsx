import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Profile, Role } from '../types/database'

interface TeamContextType {
  profile: Profile | null
  members: Profile[]
  loading: boolean
  isOwner: boolean
  canManage: boolean
  refresh: () => Promise<void>
  memberById: (id: string | null | undefined) => Profile | undefined
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setMembers([])
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name')

    if (error) {
      console.error('Fetch profiles error:', error)
      setLoading(false)
      return
    }
    const list = (data || []) as Profile[]
    setMembers(list)
    setProfile(list.find(p => p.id === user.id) || null)
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const role: Role | undefined = profile?.role

  // Tant que la migration d'équipe n'est pas appliquée, aucun profil n'existe.
  // On rend alors la main complète au compte connecté plutôt que de masquer
  // des modules à tort : la vraie barrière reste la sécurité côté base.
  const noTeamYet = !loading && !!user && !profile

  const value: TeamContextType = {
    profile,
    members,
    loading,
    isOwner: role === 'owner' || noTeamYet,
    canManage: role === 'owner' || role === 'manager' || noTeamYet,
    refresh,
    memberById: (id) => (id ? members.find(m => m.id === id) : undefined),
  }

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) throw new Error('useTeam must be used within TeamProvider')
  return context
}
