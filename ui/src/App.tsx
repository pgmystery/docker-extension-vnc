import React, { useEffect, useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Backdrop, CircularProgress, Stack } from '@mui/material'
import ConnectBar, { ConnectBarConnectedData } from './components/connectbar/ConnectBar'
import useConnectionQueue from './hooks/useConnectionQueue'
import VNCView from './components/VNCView/VNCView'
import { URL } from './libs/vnc/Proxy'
import useVNC from './hooks/useVNC'
import { isRawExecResult } from './libs/docker/cli/Exec'
import VNCProxyImagePullDialog from './components/VNCView/VNCProxyImagePullDialog'


export interface ConnectedData {
  url?: URL
  targetInfo?: ConnectBarConnectedData
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
  const [downloadingProxyImage, setDownloadingProxyImage] = useState<{containerId: string, targetPort: number} | null>(null)

  useEffect(() => {reconnect()}, [vnc])

  async function reconnect() {
    if (!vnc) return

    try {
      await vnc.reconnect()
      if (!vnc.connected) return setLoading(false)

      const targetContainerName = vnc.target.getContainerName()

      if (!targetContainerName) {
        ddClient.desktopUI.toast.error('Can\'t get the target Container name')
        setLoading(false)

        return
      }

      setConnectedData({
        url: vnc.proxy.url,
        targetInfo: {
          containerName: targetContainerName,
          port: Number(vnc.proxy.getTargetPort()),
        }
      })
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

  async function handleConnectClicked(containerId: string, targetPort: number) {
    async function connect() {
      if (!vnc) return

      const proxyDockerImageExist = await vnc.proxy.dockerImageExist()

      if (!proxyDockerImageExist)
        return setDownloadingProxyImage({
          containerId,
          targetPort,
        })

      try {
        await vnc.connect(
          containerId,
          targetPort,
        )
      }
      catch (e: any) {
        console.error(e)

        if (e instanceof Error)
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)
      }

      setLoading(false)
      if (!vnc.connected) return

      const targetContainerName = vnc.target.getContainerName()
      if (!targetContainerName) {
        ddClient.desktopUI.toast.error('Cant get container name from target')
        setLoading(false)

        return
      }

      setConnectedData({
        url: vnc.proxy.url,
        targetInfo: {
          containerName: targetContainerName,
          port: vnc.proxy.getTargetPort(),
        }
      })
    }

    if (!vnc) return

    setLoading(true)

    return connect
  }

  async function handleDisconnectClicked() {
    async function disconnect() {
      if (vnc) {
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
          connected={connectedData?.targetInfo}
        />

        {
          loading || !connectedData
            ? <div></div>
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
              connect(downloadingProxyImage?.containerId, downloadingProxyImage?.targetPort)

            setDownloadingProxyImage(null)
          }}
          ddUIToast={ddClient.desktopUI.toast}
          proxy={vnc?.proxy}
        />
      }

      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}
