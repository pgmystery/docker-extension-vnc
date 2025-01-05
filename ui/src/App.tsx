import React, { useEffect, useMemo, useState } from 'react'
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
  const [connectedData, setConnectedData] = useState<ConnectedData>()
  const dialogs = useDialogs()
  const { showBackdrop: backdrop, isBackdropShowing } = useBackdrop({
    sx: (theme) => ({ zIndex: theme.zIndex.drawer + 1 }),
  })

  useEffect(() => {
    if (!sessionStore) return

    reconnect()
  }, [sessionStore, vnc])

  function reconnect() {
    return backdrop(async () => {
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
  }

  async function handleConnectClicked(session: Session) {
    async function connect(): Promise<ConnectedData | undefined> {
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

    if (isBackdropShowing)
      return

    const connectData = await backdrop(connect)
    setConnectedData(connectData)
  }

  async function handleDisconnectClicked() {
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
        onConnect={handleConnectClicked}
        onDisconnect={handleDisconnectClicked}
        sessionStore={sessionStore}
        ddUIToast={ddClient.desktopUI.toast}
        disabled={isBackdropShowing}
      />
      <Divider />

      {
        isBackdropShowing || !connectedData
        ? <Dashboard
          ddUIToast={ddClient.desktopUI.toast}
          connect={handleConnectClicked}
          sessionStore={sessionStore}
        />
        : <VNCView
          sessionName={connectedData.sessionName}
          url={connectedData.url}
          credentials={connectedData.credentials}
          onCancel={handleDisconnectClicked}
          ddUIToast={ddClient.desktopUI.toast}
          openBrowserURL={ddClient.host.openExternal}
          sessionStore={sessionStore}
        />
      }

    </Stack>
  )
}
