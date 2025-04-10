import React, { useEffect, useMemo } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Box, Divider, Stack } from '@mui/material'
import VNCView from './components/VNCView/VNCView'
import useVNC from './hooks/useVNC'
import Dashboard from './components/dashboard/Dashboard'
import ConnectBar from './components/connectionBar/ConnectBar'
import DockerImageProxyUpdateButton from './components/proxyImage/DockerImageProxyUpdateButton'
import { VNCContext } from './contexts/VNCContext'
import useEventBus from './hooks/useEventBus'


export function App() {
  const ddClient = useMemo(createDockerDesktopClient, [])
  useEventBus(ddClient)
  const vnc = useVNC(ddClient)

  useEffect(() => {
    vnc.reconnect()
  }, [])

  return (
    vnc.sessionStore &&
    <Box
      sx={{
        height: '100%',
        position: 'relative',
      }}
    >
      <VNCContext.Provider value={vnc}>
        <Stack alignItems="start" spacing={2} sx={{
          height: '100%',
          alignItems: 'stretch',
        }}>

          <ConnectBar
            connectedSession={vnc.connectedData?.sessionName}
            onConnect={vnc.connect}
            onDisconnect={vnc.disconnect}
            sessionStore={vnc.sessionStore}
            ddUIToast={ddClient.desktopUI.toast}
            disabled={vnc.state.current !== 'ready'}
          />

          <Divider />

          {
            vnc.state.current === 'disconnecting' || !vnc.connectedData
            ? <Dashboard
                ddUIToast={ddClient.desktopUI.toast}
                connect={vnc.connect}
                sessionStore={vnc.sessionStore}
                openUrl={ddClient.host.openExternal}
              />
            :  <VNCView
                sessionName={vnc.connectedData.sessionName}
                url={vnc.connectedData.url}
                credentials={vnc.connectedData.credentials}
                onCancel={vnc.disconnect}
                ddUIToast={ddClient.desktopUI.toast}
                openBrowserURL={ddClient.host.openExternal}
                sessionStore={vnc.sessionStore}
              />
          }

        </Stack>

        <DockerImageProxyUpdateButton />
      </VNCContext.Provider>
    </Box>
  )
}
