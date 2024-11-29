import React, { useEffect, useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Backdrop, CircularProgress, Divider, Stack } from '@mui/material'
import ConnectBar from './components/connectbar/ConnectBar'
import useConnectionQueue from './hooks/useConnectionQueue'
import VNCView from './components/VNCView/VNCView'
import useVNC from './hooks/useVNC'
import { isRawExecResult } from './libs/docker/cli/Exec'
import VNCProxyImagePullDialog from './components/VNCView/VNCProxyImagePullDialog'
import Dashboard from './components/dashboard/Dashboard'
import { ConnectionData } from './libs/vnc/VNC'
import { ProxyURL } from './libs/vnc/proxies/Proxy'
import VNCConnection from './libs/vnc/connectionTypes/VNCConnection'


export interface ConnectedData {
  url: ProxyURL
  connection: VNCConnection
}


export function App() {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const vnc = useVNC(ddClient)
  const [loading, setLoading] = useState(true)
  const [connectedData, setConnectedData] = useState<ConnectedData>()
  const { connect, disconnect } = useConnectionQueue({
    onConnect: handleConnectClicked,
    onDisconnect: handleDisconnectClicked,
  })
  const [downloadingProxyImage, setDownloadingProxyImage] = useState<ConnectionData | null>(null)

  useEffect(() => {reconnect()}, [vnc])

  async function reconnect() {
    try {
      await vnc.reconnect()
      if (!vnc.connected || !vnc.connection) return setLoading(false)

      setConnectedData({
        url: vnc.connection.proxy.url,
        connection: vnc.connection,
      })
    }
    catch (e: any) {
      console.error(e)

      if (e instanceof Error)
        ddClient.desktopUI.toast.error(e.message)
      else if (isRawExecResult(e))
        ddClient.desktopUI.toast.error(e.stderr)
    }

    await vnc.disconnect()

    setLoading(false)
  }

  async function handleConnectClicked(connectionData: ConnectionData) {
    async function connect() {
      const proxyDockerImageExist = await vnc.dockerProxyImageExist()

      if (!proxyDockerImageExist)
        return setDownloadingProxyImage(connectionData)

      try {
        await vnc.connect(connectionData)
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
        url: vnc.connection?.proxy.url,
        connection: vnc.connection,
      })
    }

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
      <Stack alignItems="start" spacing={2} sx={{
        height: '100%',
        alignItems: 'stretch',
      }}>

        <ConnectBar
          onConnect={connect}
          onDisconnect={disconnect}
          disabled={loading}
          connection={vnc?.connection}
        />
        <Divider />

        {
          loading || !connectedData
            ? <Dashboard
                ddUIToast={ddClient.desktopUI.toast}
                connect={connect}
              />
            : <VNCView
                url={connectedData.url}
                onCancel={disconnect}
                ddUIToast={ddClient.desktopUI.toast}
                openBrowserURL={ddClient.host.openExternal}
              />
        }

      </Stack>

      {
        downloadingProxyImage &&
        <VNCProxyImagePullDialog
          open={!!downloadingProxyImage}
          onDone={successful => {
            if (successful)
              connect(downloadingProxyImage)

            setDownloadingProxyImage(null)
          }}
          ddUIToast={ddClient.desktopUI.toast}
          pullProxyDockerImage={(addStdout: (stdout: string)=>void, onFinish: (exitCode: number)=>void) => vnc.pullProxyDockerImage(addStdout, onFinish)}
        />
      }

      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}
