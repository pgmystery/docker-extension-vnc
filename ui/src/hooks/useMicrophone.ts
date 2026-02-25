import { useCallback, useEffect, useRef, useState } from 'react'
import eventBus from '../libs/EventBus'

export type MicrophoneStatus =
  | 'idle'
  | 'starting'
  | 'ready'
  | 'muted'
  | 'stopping'
  | 'error'
  | 'unsupported'

export interface MicrophoneType {
  startMicrophone: () => Promise<void>
  stopMicrophone: () => void

  /** Backward-compatible flag (true while publishing, even if muted). */
  isTalking: boolean

  /** Convenience flag used by UI to enable/disable controls. */
  isReady: boolean

  status: MicrophoneStatus

  isMuted: boolean
  setMuted: (muted: boolean) => void
  toggleMuted: () => void

  /** Lists available audio input devices (may require permissions in some browsers). */
  getInputDevices: () => Promise<MediaDeviceInfo[]>

  /** Currently active (or chosen) input device id. null means "default". */
  inputDeviceId: string | null

  /**
   * Switch the live microphone input device.
   * If the mic is currently publishing, swaps the outgoing track via replaceTrack().
   */
  setInputDevice: (deviceId: string | null) => Promise<void>
  getMicPermissionState: () => Promise<'granted' | 'prompt' | 'denied' | 'unknown'>
}

function waitForIceGatheringComplete(pc: RTCPeerConnection, timeoutMs = 3000): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()

  return new Promise((resolve) => {
    let done = false

    const finish = () => {
      if (done) return
      done = true
      pc.removeEventListener('icegatheringstatechange', onChange)
      resolve()
    }

    const onChange = () => {
      if (pc.iceGatheringState === 'complete') finish()
    }

    pc.addEventListener('icegatheringstatechange', onChange)
    setTimeout(finish, timeoutMs)
  })
}

export const useMicrophone = (
  audioPorts?: { signalingPort: number; audioPort: number }
): MicrophoneType | undefined => {
  const hasPorts = Boolean(audioPorts)

  // Debug logging is *opt-in* to avoid console spam.
  // Enable in DevTools: localStorage.setItem('DEBUG_MIC', '1') (disable with '0' / removeItem).
  const DEBUG_MIC =
    (typeof window !== 'undefined' && window.localStorage?.getItem('DEBUG_MIC') === '1') ?? false

  const debugLog = useCallback(
    (...args: any[]) => {
      if (!DEBUG_MIC) return
      console.log(...args)
    },
    [DEBUG_MIC]
  )

  const debugWarn = useCallback(
    (...args: any[]) => {
      if (!DEBUG_MIC) return
      console.warn(...args)
    },
    [DEBUG_MIC]
  )

  // Simple per-key throttled logger (prevents high-frequency spam even when DEBUG_MIC=1).
  const debugThrottleRef = useRef<Record<string, number>>({})
  const debugLogThrottled = useCallback(
    (key: string, minIntervalMs: number, ...args: any[]) => {
      if (!DEBUG_MIC) return
      const now = Date.now()
      const last = debugThrottleRef.current[key] ?? 0
      if (now - last < minIntervalMs) return
      debugThrottleRef.current[key] = now
      console.log(...args)
    },
    [DEBUG_MIC]
  )

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isStoppingRef = useRef(false)

  const statsTimerRef = useRef<number | null>(null)

  const [isTalking, setIsTalking] = useState(false)
  const [status, setStatus] = useState<MicrophoneStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)

  const [inputDeviceId, setInputDeviceId] = useState<string | null>(null)

  const meterCleanupRef = useRef<null | (() => void)>(null)

  const applyTrackMuteState = useCallback((muted: boolean) => {
    const stream = streamRef.current
    if (!stream) return

    stream.getAudioTracks().forEach(track => {
      track.enabled = !muted
    })
  }, [])

  const stopMicrophone = useCallback(() => {
    if (isStoppingRef.current) return
    isStoppingRef.current = true

    setStatus(prev => (prev === 'idle' ? 'idle' : 'stopping'))

    if (statsTimerRef.current) {
      window.clearInterval(statsTimerRef.current)
      statsTimerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }

    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    if (meterCleanupRef.current) {
      meterCleanupRef.current()
      meterCleanupRef.current = null
    }

    setIsTalking(false)
    setIsMuted(false)
    setStatus('idle')

    isStoppingRef.current = false
  }, [])

  const setInputDevice = useCallback(
    async (deviceId: string | null) => {
      setInputDeviceId(deviceId)

      const pc = pcRef.current
      const currentStream = streamRef.current
      if (!pc || !currentStream) return
      if (!navigator?.mediaDevices?.getUserMedia) return

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId
          ? { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })

      const newTrack = newStream.getAudioTracks()[0]
      if (!newTrack) {
        newStream.getTracks().forEach(t => t.stop())
        return
      }

      newTrack.enabled = !isMuted

      const sender = pc.getSenders().find(s => s.track?.kind === 'audio')
      if (sender) {
        await sender.replaceTrack(newTrack)
      }

      const oldTracks = currentStream.getAudioTracks()
      oldTracks.forEach(t => {
        currentStream.removeTrack(t)
        t.stop()
      })
      currentStream.addTrack(newTrack)

      newStream.getTracks().forEach(t => {
        if (t !== newTrack) t.stop()
      })

      const actualId = newTrack.getSettings().deviceId ?? deviceId
      setInputDeviceId(actualId ?? null)
    },
    [isMuted]
  )

  const startMicrophone = useCallback(async () => {
    if (!hasPorts) {
      setStatus('error')
      console.error('Mic Error: audioPorts not provided (WHIP signaling port missing).')
      return
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }

    if (pcRef.current && streamRef.current) return

    setStatus('starting')

    try {
      // 1) CAPTURE MIC FIRST (this was missing)
      const constraints: MediaStreamConstraints = {
        audio: inputDeviceId
          ? {
              deviceId: { exact: inputDeviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const audioTrack = stream.getAudioTracks()[0]
      if (!audioTrack) {
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
        throw new Error('No audio track available from getUserMedia(). Check permissions and device availability.')
      }

      audioTrack.onended = () => {
        stopMicrophone()
      }

      applyTrackMuteState(isMuted)

      // 2) Create peer connection and add the track
      const pc = new RTCPeerConnection({ iceServers: [] })
      pcRef.current = pc

      pc.oniceconnectionstatechange = () => {
        debugLogThrottled('iceConnection', 2000, 'mic iceConnectionState:', pc.iceConnectionState)
      }
      pc.onicegatheringstatechange = () => {
        debugLogThrottled('iceGathering', 2000, 'mic iceGatheringState:', pc.iceGatheringState)
      }

      pc.onconnectionstatechange = () => {
        const st = pc.connectionState
        debugLogThrottled('connectionState', 1000, 'mic connectionState:', st)

        if (st === 'failed' || st === 'closed') {
          if (!isStoppingRef.current) stopMicrophone()
        }
      }

      pc.addTrack(audioTrack, stream)

      // 3) Local capture meter (debug) — now stream exists
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        const ctx: AudioContext = new AudioCtx()

        if (ctx.state === 'suspended') await ctx.resume()

        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 2048
        source.connect(analyser)

        const data = new Uint8Array(analyser.fftSize)
        let t: number | null = null

        const tick = () => {
          analyser.getByteTimeDomainData(data)
          let sumSq = 0
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128
            sumSq += v * v
          }
          const rms = Math.sqrt(sumSq / data.length)

          // Only log RMS when debug is enabled, and throttle it heavily.
          debugLogThrottled('rms', 5000, '[mic] local RMS:', rms.toFixed(4))

          t = window.setTimeout(tick, 500)
        }
        tick()

        meterCleanupRef.current = () => {
          if (t) window.clearTimeout(t)
          source.disconnect()
          analyser.disconnect()
          ctx.close()
        }
      } catch (e) {
        console.warn('[mic] meter failed:', e)
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      await waitForIceGatheringComplete(pc, 4000)

      const localSdp = pc.localDescription?.sdp
      if (!localSdp) {
        throw new Error('LocalDescription SDP missing after ICE gathering.')
      }

      const response = await fetch(`http://localhost:${audioPorts!.signalingPort}/mic/whip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: localSdp,
      })

      if (!response.ok) {
        throw new Error(`WHIP publish failed: HTTP ${response.status}`)
      }

      const answer = await response.text()
      debugLog('[mic] WHIP answer', answer)
      await pc.setRemoteDescription({ type: 'answer', sdp: answer })

      if (statsTimerRef.current) {
        window.clearInterval(statsTimerRef.current)
        statsTimerRef.current = null
      }

      statsTimerRef.current = window.setInterval(async () => {
        const activePc = pcRef.current
        if (!activePc) return

        try {
          const stats = await activePc.getStats()
          stats.forEach(report => {
            if (report.type !== 'outbound-rtp') return

            const anyReport = report as any
            const mediaType = anyReport.kind ?? anyReport.mediaType

            if (mediaType !== 'audio') return

            const bytesSent = anyReport.bytesSent
            const packetsSent = anyReport.packetsSent
            const active = anyReport.active

            // Only log stats when debug is enabled, and throttle.
            debugLogThrottled(
              'outboundStats',
              10000,
              '[mic] outbound audio stats:',
              { bytesSent, packetsSent, active }
            )
          })

          stats.forEach(r => {
            if (r.type === 'candidate-pair' && (r as any).selected) {
              const a = r as any
              debugLogThrottled('candidatePair', 10000, '[mic] selected candidate pair:', {
                state: a.state,
                nominated: a.nominated,
                localCandidateId: a.localCandidateId,
                remoteCandidateId: a.remoteCandidateId,
                currentRoundTripTime: a.currentRoundTripTime,
              })
            }
          })
        } catch (e) {
          debugWarn('[mic] getStats failed:', e)
        }
      }, 1000)

      setIsTalking(true)
      setStatus(isMuted ? 'muted' : 'ready')
    } catch (err: any) {
      eventBus.emit('showError', 'Mic error: ' + err.message)
      setStatus('error')
      stopMicrophone()
    }
  }, [hasPorts, audioPorts, applyTrackMuteState, inputDeviceId, isMuted, stopMicrophone, debugLog, debugLogThrottled, debugWarn])

  const setMuted = useCallback(
    (muted: boolean) => {
      setIsMuted(muted)
      applyTrackMuteState(muted)

      setStatus(prev => {
        if (prev === 'ready' || prev === 'muted') return muted ? 'muted' : 'ready'
        return prev
      })
    },
    [applyTrackMuteState]
  )

  const toggleMuted = useCallback(() => setMuted(!isMuted), [isMuted, setMuted])

  const getInputDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    if (!navigator?.mediaDevices?.enumerateDevices) {
      return []
    }

    if (!streamRef.current && navigator.mediaDevices.getUserMedia) {
      try {
        const tmp = await navigator.mediaDevices.getUserMedia({ audio: true })
        tmp.getTracks().forEach(t => t.stop())
      } catch {
        // ignore
      }
    }

    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(d => d.kind === 'audioinput')
  }, [])

  useEffect(() => {
    return () => {
      stopMicrophone()
    }
  }, [stopMicrophone])

  // If ports disappear (or change), stop publishing to avoid stale sessions.
  useEffect(() => {
    if (!hasPorts) {
      stopMicrophone()
      return
    }

    // Optional: if signalingPort changes, you may want to stop+restart explicitly.
    // For now we just stop to avoid publishing to the old endpoint.
    stopMicrophone()
  }, [hasPorts, audioPorts?.signalingPort, stopMicrophone])

  const isReady = status === 'ready' || status === 'muted'

  async function getMicPermissionState() {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      return status.state
    } catch {
      return 'unknown'
    }
  }

  if (!hasPorts) return

  return {
    startMicrophone,
    stopMicrophone,
    isTalking,
    isReady,
    status,
    isMuted,
    setMuted,
    toggleMuted,
    getInputDevices,
    inputDeviceId,
    setInputDevice,
    getMicPermissionState,
  }
}
