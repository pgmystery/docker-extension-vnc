import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Divider, Stack } from '@mui/material'
import VNCView, { VNCCredentials } from './components/VNCView/VNCView'
import useVNC from './hooks/useVNC'
import { isRawExecResult } from './libs/docker/cli/Exec'
import VNCProxyImagePullDialog from './components/VNCView/VNCProxyImagePullDialog'
import Dashboard from './components/dashboard/Dashboard'
import { VNCConnectionType } from './libs/vnc/VNC'
import { ProxyURL } from './libs/vnc/proxies/Proxy'
import ConnectBar from './components/sessionsbar/ConnectBar'
import { getSessionStore } from './stores/sessionStore'
import { Session } from './types/session'
import { useDialogs } from '@toolpad/core'
import useBackdrop from './hooks/useBackdrops/useBackdrop'


export interface ConnectedData {
  sessionName: string
  url: ProxyURL
  connection: VNCConnectionType
  credentials?: VNCCredentials
}


export function App() {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const sessionStore = useMemo(getSessionStore, [])
  const vnc = useVNC(ddClient)
  const tryToConnect = useRef<boolean>(true)
  const [connectedData, setConnectedData] = useState<ConnectedData>()
  const dialogs = useDialogs()
  const { showBackdrop: backdrop, isBackdropShowing } = useBackdrop({
    sx: (theme) => ({ zIndex: theme.zIndex.drawer + 1 }),
  })

  useEffect(() => {
    if (!sessionStore) return

    reconnect()
  }, [sessionStore, vnc])

  async function reconnect() {
    tryToConnect.current = true

    await backdrop(async () => {
      try {
        await vnc.reconnect(sessionStore)
        if (!vnc.connected || !vnc.connection) return

        const sessionName = vnc.connection.proxy.getSessionName()
        const session = await sessionStore?.getSessionByName(sessionName)

        if (!session) {
          ddClient.desktopUI.toast.error(`Try to connect to the session "${sessionName}", but the session don't exist anymore.`)
          return await vnc.disconnect()
        }

        setConnectedData({
          sessionName: sessionName,
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

    tryToConnect.current = false
  }

  async function connect(session: Session) {
    async function _connect(): Promise<ConnectedData | undefined> {
      const proxyDockerImageExist = await vnc.dockerProxyImageExist()

      if (!proxyDockerImageExist)
        await dialogs.open(VNCProxyImagePullDialog, {})

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

    if (tryToConnect.current || connectedData !== undefined)
      return

    tryToConnect.current = true

    const connectData = await backdrop(_connect)
    setConnectedData(connectData)

    tryToConnect.current = false
  }

  async function disconnect() {
    try {
      await backdrop(() => vnc.disconnect())
    }
    catch (e: any) {
      console.error(e)

      if (e instanceof Error)
        ddClient.desktopUI.toast.error(e.message)
      else if (isRawExecResult(e))
        ddClient.desktopUI.toast.error(e.stderr)
    }

    setConnectedData(undefined)
  }

  return (
    sessionStore &&
    <Stack alignItems="start" spacing={2} sx={{
      height: '100%',
      alignItems: 'stretch',
    }}>

      <ConnectBar
        connectedSession={connectedData?.sessionName}
        onConnect={connect}
        onDisconnect={disconnect}
        sessionStore={sessionStore}
        ddUIToast={ddClient.desktopUI.toast}
        disabled={isBackdropShowing}
      />
      <Divider />

      {
        isBackdropShowing || !connectedData
        ? <Dashboard
          ddUIToast={ddClient.desktopUI.toast}
          connect={connect}
          sessionStore={sessionStore}
        />
        : <VNCView
          sessionName={connectedData.sessionName}
          url={connectedData.url}
          credentials={connectedData.credentials}
          onCancel={disconnect}
          ddUIToast={ddClient.desktopUI.toast}
          openBrowserURL={ddClient.host.openExternal}
          sessionStore={sessionStore}
        />
      }

    </Stack>
  )
}
