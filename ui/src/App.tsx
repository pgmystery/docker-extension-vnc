import React, { useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Backdrop, CircularProgress, Stack } from '@mui/material'
import VNC from './libs/VNC'
import ConnectBar, { ConnectBarConnectedData } from './components/connectbar/ConnectBar'
import useConnectionQueue from './hooks/useConnectionQueue'
import VNCView from './components/VNCView/VNCView'


export interface ConnectedData {
  url: string
  targetInfo?: ConnectBarConnectedData
}


export function App() {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const vnc = useMemo(() => new VNC(), [ddClient])
  const [loading, setLoading] = useState(true)
  const [connectedData, setConnectedData] = useState<ConnectedData>({
    url: '',
  })
  const { connect, disconnect } = useConnectionQueue({
    onConnect: handleConnectClicked,
    onDisconnect: handleDisconnectClicked,
    onReconnect: reconnect,
  }, {type: 'reconnect'})

  async function reconnect() {
    const proxyContainer = await vnc.reconnect()

    if (!proxyContainer) {
      setLoading(false)

      return
    }

    const targetContainerName = await proxyContainer.getTargetContainerName()

    setConnectedData({
      url: proxyContainer.url,
      targetInfo: {
        containerName: targetContainerName,
        port: Number(proxyContainer.getTargetPort()),
      }
    })
    setLoading(false)
  }

  async function handleConnectClicked(containerId: string, targetPort: number) {
    async function connect() {
      const proxyContainer = await vnc.connect(
        containerId,
        targetPort,
      )

      setLoading(false)
      if (!proxyContainer) return

      const targetContainerName = await proxyContainer.getTargetContainerName()

      setConnectedData({
        url: proxyContainer.url,
        targetInfo: {
          containerName: targetContainerName,
          port: Number(proxyContainer.getTargetPort()),
        }
      })
    }

    if (!vnc) return

    setLoading(true)

    return connect
  }

  async function handleDisconnectClicked() {
    async function disconnect() {
      await vnc.disconnect()

      setConnectedData({
        url: '',
      })
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
          connected={connectedData.targetInfo}
        />

        {
          loading || connectedData.url === '' || !connectedData.url
            ? <div></div>
            : <VNCView url={connectedData.url} onCancel={disconnect} />
        }

      </Stack>

      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}
