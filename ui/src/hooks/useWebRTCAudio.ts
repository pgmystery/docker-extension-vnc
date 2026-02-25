import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { getVNCSettingsStore } from '../stores/vncSettingsStore'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export interface WebRTCAudioConfig {
  url: string
  path: string
  audioPort: number
}

export interface WebRTCAudioType {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  status: RTCIceConnectionState
  error: string | null
  isReady: boolean

  volumeRef: React.MutableRefObject<number> // 0..100
  mutedRef: React.MutableRefObject<boolean>

  setVolume: (nextVolume: number) => void
  setMuted: (nextMuted: boolean) => void

  connect: () => void
  disconnect: () => void
}

export const useWebRTCAudio = (config?: WebRTCAudioConfig): WebRTCAudioType | undefined => {
  const hasConfig = Boolean(config)

  const vncSettingsStore = useMemo(getVNCSettingsStore, [])
  const vncSettings = useSyncExternalStore(vncSettingsStore.subscribe, vncSettingsStore.getSnapshot)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasReceivedTrackRef = useRef<boolean>(false)

  const [status, setStatus] = useState<RTCIceConnectionState>('new')
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [isEnabled, setIsEnabled] = useState<boolean>(true)

  const volumeRef = useRef<number>(clamp(vncSettings.audio.output.volume, 0, 100)) // 0..100
  const mutedRef = useRef<boolean>(Boolean(vncSettings.audio.output.muted))

  const applyAudioSettings = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.volume = clamp(volumeRef.current, 0, 100) / 100
    audioRef.current.muted = Boolean(mutedRef.current)
  }, [])

  const cleanup = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }

    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    hasReceivedTrackRef.current = false
    setIsReady(false)
    setStatus('closed')
    setError(null)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    volumeRef.current = clamp(vncSettings.audio.output.volume, 0, 100)
    mutedRef.current = Boolean(vncSettings.audio.output.muted)
    applyAudioSettings()
  }, [vncSettings.audio.output.volume, vncSettings.audio.output.muted, applyAudioSettings])

  const connect = useCallback(() => {
    setIsEnabled(true)
  }, [])

  const disconnect = useCallback(() => {
    setIsEnabled(false)
    cleanup()
  }, [cleanup])

  useEffect(() => {
    // If there is no config, force cleanup and do not attempt to connect.
    if (!hasConfig) {
      cleanup()
      return
    }

    vncSettings.audio.output.enabled ? connect() : disconnect()
  }, [hasConfig, vncSettings.audio.output.enabled, connect, disconnect, cleanup])

  const setVolume = useCallback((nextVolume: number) => {
    volumeRef.current = clamp(nextVolume, 0, 100)
    applyAudioSettings()
  }, [applyAudioSettings])

  const setMuted = useCallback((nextMuted: boolean) => {
    mutedRef.current = Boolean(nextMuted)
    applyAudioSettings()
  }, [applyAudioSettings])

  useEffect(() => {
    applyAudioSettings()
  }, [applyAudioSettings])

  useEffect(() => {
    if (!hasConfig || !isEnabled) {
      cleanup()
      return
    }

    const startStream = async (attempt = 0) => {
      // 1. Cleanup any previous instance before a new attempt
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
      }

      hasReceivedTrackRef.current = false
      setIsReady(false)
      setStatus('checking')

      try {
        console.log(`[WebRTC] Connection attempt ${attempt + 1} to ${config!.url}/${config!.path}`)
        setError(null)

        const pc = new RTCPeerConnection({ iceServers: [] })
        pcRef.current = pc

        const updateReady = () => {
          const iceOk =
            pc.iceConnectionState === 'connected' ||
            pc.iceConnectionState === 'completed'

          // Consider the audio "ready" only once:
          // - ICE is connected/completed AND
          // - we've received at least one audio track
          setIsReady(iceOk && hasReceivedTrackRef.current)
        }

        pc.oniceconnectionstatechange = () => {
          console.log('[WebRTC] ICE State:', pc.iceConnectionState)
          setStatus(pc.iceConnectionState)

          if (
            pc.iceConnectionState === 'failed' ||
            pc.iceConnectionState === 'disconnected' ||
            pc.iceConnectionState === 'closed'
          ) {
            setIsReady(false)
          } else {
            updateReady()
          }
        }

        pc.ontrack = (event) => {
          hasReceivedTrackRef.current = true

          if (audioRef.current) {
            audioRef.current.srcObject = event.streams[0]

            // Apply current settings without causing re-renders or effect restarts
            applyAudioSettings()

            audioRef.current.play().catch(err => {
              console.warn('Autoplay blocked or stream interrupted:', err)
            })
          }

          updateReady()
        }

        const transceiver = pc.addTransceiver('audio', { direction: 'recvonly' })

        // This is a newer Chrome/Electron feature to minimize latency
        if ('playoutDelayHint' in transceiver.receiver) {
          // Setting target delay to 0ms
          transceiver.receiver.playoutDelayHint = 0
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        // 2. Exchange SDP
        const response = await fetch(`${config!.url}/${config!.path}/whep`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: offer.sdp,
        })

        // If 404, the path exists but FFmpeg hasn't pushed data yet
        if (!response.ok) {
          throw new Error(`WHEP server returned ${response.status}`)
        }

        let answerSdp = await response.text()

        console.log('[WebRTC] Received SDP:', answerSdp)

        // 3. DYNAMIC PORT MUNGING
        // Detect the port used for the API call and apply it to the data candidate
        answerSdp = answerSdp.replaceAll(' 8189 ', ` ${config!.audioPort} `)

        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
        console.log('✅ WebRTC Handshake Successful')
      } catch (err) {
        setIsReady(false)

        const msg = err instanceof Error ? err.message : String(err)
        console.error('[WebRTC] Error:', msg)

        // 4. RETRY LOGIC with Exponential Backoff
        // Wait 1s, 2s, 4s, then stay at 5s intervals
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        setError(`${msg}. Retrying in ${delay / 1000}s...`)

        retryTimerRef.current = setTimeout(() => {
          // Don’t keep retrying if the user manually disconnected in the meantime
          if (!isEnabled) return
          startStream(attempt + 1)
        }, delay)
      }
    }

    startStream()

    return () => {
      cleanup()
    }
  }, [hasConfig, config, applyAudioSettings, cleanup, isEnabled])

  if (!hasConfig) return

  return {
    audioRef,
    status,
    error,
    isReady,
    volumeRef,
    mutedRef,
    setVolume,
    setMuted,
    connect,
    disconnect,
  }
}
