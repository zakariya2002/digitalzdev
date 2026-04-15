import { useState, useRef, useCallback } from 'react'
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
  const [status, setStatus] = useState<TwilioStatus>('idle')
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const deviceRef = useRef<Device | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initializingRef = useRef(false)

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

  // Initialize device lazily — only called after user gesture
  const ensureDevice = useCallback(async (): Promise<Device | null> => {
    if (deviceRef.current) return deviceRef.current
    if (initializingRef.current) return null

    initializingRef.current = true
    try {
      const token = await fetchTwilioToken()

      // Pre-create audio element to avoid _onAddTrack error
      let audioElement = document.getElementById('twilio-audio') as HTMLAudioElement | null
      if (!audioElement) {
        audioElement = document.createElement('audio')
        audioElement.id = 'twilio-audio'
        audioElement.autoplay = true
        document.body.appendChild(audioElement)
      }

      const device = new Device(token, {
        edge: 'ashburn',
        closeProtection: true,
        sounds: {
          incoming: undefined,
          outgoing: undefined,
          disconnect: undefined,
        },
      })

      device.audio?.speakerDevices.set('default')
      device.audio?.ringtoneDevices.set('default')

      device.on('registered', () => {
        setStatus('idle')
      })

      device.on('incoming', (call: Call) => {
        setActiveCall(call)
        setStatus('incoming')
        setupCallEvents(call)
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
        setError(err.message || 'Erreur Twilio')
        setStatus('error')
      })

      await device.register()
      deviceRef.current = device
      initializingRef.current = false
      return device
    } catch (e) {
      console.error('Twilio init error:', e)
      setError(e instanceof Error ? e.message : 'Erreur initialisation Twilio')
      setStatus('error')
      initializingRef.current = false
      return null
    }
  }, [setupCallEvents])

  const makeCall = useCallback(
    async (phoneNumber: string) => {
      setStatus('calling')
      try {
        // Initialize device on first call (user gesture context)
        const device = await ensureDevice()
        if (!device) {
          setStatus('idle')
          return
        }

        const call = await device.connect({
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
    [ensureDevice, setupCallEvents]
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
