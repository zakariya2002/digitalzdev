import { useState, useEffect, useRef, useCallback } from 'react'
import { Device, Call } from '@twilio/voice-sdk'
import { fetchTwilioToken } from '../lib/twilio'

export type TwilioStatus = 'loading' | 'idle' | 'calling' | 'in-call' | 'incoming' | 'error'

export interface TwilioDeviceState {
  status: TwilioStatus
  activeCall: Call | null
  isMuted: boolean
  callDuration: number
  error: string | null
  makeCall: (phoneNumber: string) => Promise<void>
  hangup: () => void
  toggleMute: () => void
  acceptIncoming: () => void
  rejectIncoming: () => void
}

export function useTwilioDevice(): TwilioDeviceState {
  const [status, setStatus] = useState<TwilioStatus>('loading')
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const deviceRef = useRef<Device | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    setCallDuration(0)
    timerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const cleanupCall = useCallback(() => {
    setActiveCall(null)
    setIsMuted(false)
    stopTimer()
    setStatus('idle')
  }, [stopTimer])

  const setupCallEvents = useCallback(
    (call: Call) => {
      call.on('accept', () => {
        setStatus('in-call')
        startTimer()
      })
      call.on('disconnect', () => {
        cleanupCall()
      })
      call.on('cancel', () => {
        cleanupCall()
      })
      call.on('reject', () => {
        cleanupCall()
      })
    },
    [startTimer, cleanupCall]
  )

  // Initialize device
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const token = await fetchTwilioToken()
        if (!mounted) return

        const device = new Device(token, {
          edge: 'ashburn',
          closeProtection: true,
        })

        device.on('registered', () => {
          if (mounted) setStatus('idle')
        })

        device.on('incoming', (call: Call) => {
          if (mounted) {
            setActiveCall(call)
            setStatus('incoming')
            setupCallEvents(call)
          }
        })

        device.on('tokenWillExpire', async () => {
          try {
            const newToken = await fetchTwilioToken()
            device.updateToken(newToken)
          } catch (e) {
            console.error('Token refresh error:', e)
          }
        })

        device.on('error', (err) => {
          console.error('Twilio device error:', err)
          if (mounted) {
            setError(err.message || 'Erreur Twilio')
            setStatus('error')
          }
        })

        await device.register()
        deviceRef.current = device
      } catch (e) {
        if (mounted) {
          console.error('Twilio init error:', e)
          setError(e instanceof Error ? e.message : 'Erreur initialisation Twilio')
          setStatus('error')
        }
      }
    }

    init()

    return () => {
      mounted = false
      stopTimer()
      deviceRef.current?.destroy()
      deviceRef.current = null
    }
  }, [setupCallEvents, stopTimer])

  const makeCall = useCallback(
    async (phoneNumber: string) => {
      if (!deviceRef.current || status !== 'idle') return

      setStatus('calling')
      try {
        const call = await deviceRef.current.connect({
          params: { To: phoneNumber },
        })
        setActiveCall(call)
        setupCallEvents(call)
      } catch (e) {
        console.error('makeCall error:', e)
        setError(e instanceof Error ? e.message : 'Erreur appel')
        setStatus('idle')
      }
    },
    [status, setupCallEvents]
  )

  const hangup = useCallback(() => {
    activeCall?.disconnect()
  }, [activeCall])

  const toggleMute = useCallback(() => {
    if (activeCall) {
      const newMuted = !isMuted
      activeCall.mute(newMuted)
      setIsMuted(newMuted)
    }
  }, [activeCall, isMuted])

  const acceptIncoming = useCallback(() => {
    activeCall?.accept()
  }, [activeCall])

  const rejectIncoming = useCallback(() => {
    activeCall?.reject()
  }, [activeCall])

  return {
    status,
    activeCall,
    isMuted,
    callDuration,
    error,
    makeCall,
    hangup,
    toggleMute,
    acceptIncoming,
    rejectIncoming,
  }
}
