import { MutableRefObject, useCallback, useMemo, useRef, useState } from 'react'
import VNC, { ConnectionType } from '../libs/vnc/VNC'
import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import { isRawExecResult } from '../libs/docker/cli/Exec'
import { Session } from '../types/session'
import useImagePullDialog from './useImagePullDialog'
import useBackdrop from './useBackdrops/useBackdrop'
import { getSessionStore, SessionStore } from '../stores/sessionStore'
import { AudioData, ProxyURL } from '../libs/vnc/proxies/Proxy'
import { VNCCredentials } from '../components/VNCView/VNCView'
import VNCConnection from '../libs/vnc/connectionTypes/VNCConnection'

export interface ConnectedData {
  sessionName: string
  url: ProxyURL
  connection: VNCConnection<ConnectionType>
  credentials?: VNCCredentials
  audioData?: AudioData
}

export interface VNCHandler {
  vnc: VNC,
  connect: (session: Session) => Promise<void>
  disconnect: () => Promise<void>
  reconnect: () => Promise<boolean>
  sessionStore: SessionStore | undefined
  state: MutableRefObject<VNCState>
  connectedData: ConnectedData | undefined
  refreshAudioData: () => Promise<void>
}

export enum VNCState {
  READY,
  DISCONNECTING,
  CONNECTING,
}

export default function useVNC(ddClient: DockerDesktopClient): VNCHandler {
  const vnc = useMemo(() => new VNC({docker: ddClient.docker}), [ddClient.docker])
  const [connectedData, setConnectedData] = useState<ConnectedData>()
  let sessionStore: SessionStore | undefined
  try {
    sessionStore = useMemo(getSessionStore, [])
  }
  catch (_) {}
  const state = useRef<VNCState>(VNCState.READY)
  const pullDockerImage = useImagePullDialog()
  const backdrop = useBackdrop({
    sx: (theme) => ({ zIndex: theme.zIndex.drawer + 1 }),
  })

  async function reconnect(): Promise<boolean> {
    state.current = VNCState.CONNECTING

    return backdrop.open(async (): Promise<boolean> => {
      try {
        if (!sessionStore)
          return false

        await vnc.reconnect()
        if (!vnc.connected || !vnc.connection)
          return false

        const sessionName = vnc.connection.proxy.getSessionName()
        const session = await sessionStore.getSessionByName(sessionName)

        if (!session) {
          ddClient.desktopUI.toast.error(`Try to connect to the session "${sessionName}", but the session don't exist anymore.`)
          await vnc.disconnect()

          return false
        }

        setConnectedData({
          sessionName,
          url: vnc.connection.proxy.url,
          connection: vnc.connection,
          credentials: session.credentials,
          audioData: await vnc.connection.proxy.getAudioData(),
        })

        return true
      }
      catch (e: any) {
        console.error(e)

        if (e instanceof Object && e.hasOwnProperty('message'))
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)

        await vnc.disconnect()

        return false
      }
      finally {
        state.current = VNCState.READY
      }
    })
  }

  async function connect(session: Session) {
    async function _connect(): Promise<ConnectedData | undefined> {
      const proxyDockerImageExist = await vnc.dockerProxyImageExist()

      if (!proxyDockerImageExist)
        await pullDockerImage(vnc.proxyDockerImage)

      try {
        await vnc.connect(session.name, session.connection)
      }
      catch (e: any) {
        if (e instanceof Object && e.hasOwnProperty('message'))
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)

        await vnc.disconnect()
      }

      if (!vnc.connected || !vnc.connection) return

      return {
        sessionName: vnc.connection.proxy.getSessionName(),
        url: vnc.connection.proxy.url,
        connection: vnc.connection,
        credentials: session.credentials,
        audioData: await vnc.connection.proxy.getAudioData(),
      }
    }

    if (state.current === VNCState.CONNECTING)
      return

    if (connectedData !== undefined)
      await disconnect()

    state.current = VNCState.CONNECTING

    const connectData = await backdrop.open(_connect)
    setConnectedData(connectData)

    state.current = VNCState.READY
  }

  async function disconnect() {
    state.current = VNCState.DISCONNECTING

    try {
      await backdrop.open(() => vnc.disconnect())
    }
    catch (e: any) {
      console.error(e)

      if (e instanceof Object && e.hasOwnProperty('message'))
        ddClient.desktopUI.toast.error(e.message)
      else if (isRawExecResult(e))
        ddClient.desktopUI.toast.error(e.stderr)
    }

    setConnectedData(undefined)
    state.current = VNCState.READY
  }

  const refreshAudioData = useCallback(async () => {
    if (!vnc.connection) return

    // Ensure proxy.container has fresh port mappings before reading NetworkSettings.Ports
    await vnc.connection.proxy.update()

    const audioData = await vnc.connection.proxy.getAudioData()

    setConnectedData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        audioData,
      }
    })
  }, [vnc])

  return {
    vnc,
    connect,
    disconnect,
    reconnect,
    sessionStore,
    state,
    connectedData,
    refreshAudioData,
  }
}
