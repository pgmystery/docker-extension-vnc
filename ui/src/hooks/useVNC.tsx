import { MutableRefObject, useMemo, useRef, useState } from 'react'
import VNC, { ConnectionType } from '../libs/vnc/VNC'
import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import { isRawExecResult } from '../libs/docker/cli/Exec'
import { Session } from '../types/session'
import useImagePullDialog from './useImagePullDialog'
import useBackdrop from './useBackdrops/useBackdrop'
import { getSessionStore, SessionStore } from '../stores/sessionStore'
import { ProxyURL } from '../libs/vnc/proxies/Proxy'
import { VNCCredentials } from '../components/VNCView/VNCView'
import VNCConnection from '../libs/vnc/connectionTypes/VNCConnection'

export interface ConnectedData {
  sessionName: string
  url: ProxyURL
  connection: VNCConnection<ConnectionType>
  credentials?: VNCCredentials
}

export interface VNCHandler {
  vnc: VNC,
  connect: (session: Session) => Promise<void>
  disconnect: () => Promise<void>
  reconnect: () => Promise<void>
  sessionStore: SessionStore | undefined
  state: MutableRefObject<VNCHandlerState>
  connectedData: ConnectedData | undefined
}

type VNCHandlerState = 'ready' | 'disconnecting' | 'connecting'

export default function useVNC(ddClient: DockerDesktopClient): VNCHandler {
  const vnc = useMemo(() => new VNC(ddClient.docker), [ddClient.docker])
  const [connectedData, setConnectedData] = useState<ConnectedData>()
  const sessionStore = useMemo(getSessionStore, [])
  const state = useRef<VNCHandlerState>('ready')
  const pullDockerImage = useImagePullDialog()
  const backdrop = useBackdrop({
    sx: (theme) => ({ zIndex: theme.zIndex.drawer + 1 }),
  })

  async function reconnect() {
    state.current = 'connecting'

    await backdrop.open(async () => {
      try {
        if (!sessionStore)
          return

        await vnc.reconnect()
        if (!vnc.connected || !vnc.connection)
          return

        const sessionName = vnc.connection.proxy.getSessionName()
        const session = await sessionStore.getSessionByName(sessionName)

        if (!session) {
          ddClient.desktopUI.toast.error(`Try to connect to the session "${sessionName}", but the session don't exist anymore.`)
          return await vnc.disconnect()
        }

        setConnectedData({
          sessionName,
          url: vnc.connection.proxy.url,
          connection: vnc.connection,
          credentials: session.credentials,
        })
      }
      catch (e: any) {
        console.error(e)

        if (e instanceof Error)
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)

        await vnc.disconnect()
      }
    })

    state.current = 'ready'
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
        if (e instanceof Error)
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
      }
    }

    if (state.current === 'connecting' || connectedData !== undefined)
      return

    state.current = 'connecting'

    const connectData = await backdrop.open(_connect)
    setConnectedData(connectData)

    state.current = 'ready'
  }

  async function disconnect() {
    state.current = 'disconnecting'

    try {
      await backdrop.open(() => vnc.disconnect())
    }
    catch (e: any) {
      console.error(e)

      if (e instanceof Error)
        ddClient.desktopUI.toast.error(e.message)
      else if (isRawExecResult(e))
        ddClient.desktopUI.toast.error(e.stderr)
    }

    setConnectedData(undefined)
    state.current = 'ready'
  }

  return {
    vnc,
    connect,
    disconnect,
    reconnect,
    sessionStore,
    state,
    connectedData,
  }
}
