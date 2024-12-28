import React, { useEffect, useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Backdrop, CircularProgress, Divider, Stack } from '@mui/material'
import useConnectionQueue from './hooks/useConnectionQueue'
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
  const [loading, setLoading] = useState(true)
  const [connectedData, setConnectedData] = useState<ConnectedData>()
  const { connect, disconnect } = useConnectionQueue({
    onConnect: handleConnectClicked,
    onDisconnect: handleDisconnectClicked,
  })
  const dialogs = useDialogs()
  // const [downloadingProxyImage, setDownloadingProxyImage] = useState<Session | null>(null)

  useEffect(() => {
    if (!sessionStore) return

    reconnect()
  }, [sessionStore, vnc])

  async function reconnect() {
    try {
      await vnc.reconnect(sessionStore)
      if (!vnc.connected || !vnc.connection) return setLoading(false)

      const sessionName = vnc.connection.proxy.getSessionName()
      const session = await sessionStore?.getSessionByName(sessionName)

      if (!session) {
        ddClient.desktopUI.toast.error(`Try to connect to the session "${sessionName}", but the session don't exist anymore.`)
        await vnc.disconnect()

        return setLoading(false)
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


    setLoading(false)
  }

  async function handleConnectClicked(session: Session) {
    async function connect() {
      const proxyDockerImageExist = await vnc.dockerProxyImageExist()

      if (!proxyDockerImageExist)
        await dialogs.open(VNCProxyImagePullDialog, {})

      try {
        console.log('VNC CONNECT START')
        await vnc.connect(session.name, session.connection)
        console.log('CONNECT DONE')
      }
      catch (e: any) {
        console.error(e)

        if (e instanceof Error)
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)

        await vnc.disconnect()
      }

      setLoading(false)
      if (!vnc.connected || !vnc.connection) return

      setConnectedData({
        sessionName: vnc.connection.proxy.getSessionName(),
        url: vnc.connection.proxy.url,
        connection: vnc.connection,
        credentials: session.credentials,
      })
    }

    if (loading)
      return

    setLoading(true)

    return connect
  }

  async function handleDisconnectClicked() {
    async function disconnect() {
      try {
        await vnc.disconnect()

        setConnectedData(undefined)
      }
      catch (e: any) {
        console.error(e)

        if (e instanceof Error)
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)
      }

      setLoading(false)
    }

    setLoading(true)

    return disconnect
  }

  return (
    <>
      {
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
            disabled={loading}
          />
          <Divider />

          {
            loading || !connectedData
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
      }

      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}
