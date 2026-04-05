import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useTwilioDevice, type TwilioDeviceState } from '../hooks/useTwilioDevice'

const TwilioContext = createContext<TwilioDeviceState | null>(null)

function TwilioDeviceProvider({ children }: { children: ReactNode }) {
  const state = useTwilioDevice()
  return (
    <TwilioContext.Provider value={state}>
      {children}
    </TwilioContext.Provider>
  )
}

export function TwilioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  // N'initialise le Device que si l'utilisateur est authentifié
  if (!user) {
    return <>{children}</>
  }

  return (
    <TwilioDeviceProvider>
      {children}
    </TwilioDeviceProvider>
  )
}

export function useTwilio(): TwilioDeviceState {
  const context = useContext(TwilioContext)
  if (!context) {
    // Retourner un état par défaut si pas de contexte (non authentifié)
    return {
      status: 'loading',
      activeCall: null,
      isMuted: false,
      callDuration: 0,
      error: null,
      makeCall: async () => {},
      hangup: () => {},
      toggleMute: () => {},
      acceptIncoming: () => {},
      rejectIncoming: () => {},
    }
  }
  return context
}
