import React, { useEffect, useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Box, Divider, Stack } from '@mui/material'
import VNCView from './components/VNCView/VNCView'
import useVNC, { VNCState } from './hooks/useVNC'
import ConnectBar from './components/connectionBar/ConnectBar'
import DockerImageProxyUpdateButton from './components/proxyImage/DockerImageProxyUpdateButton'
import { VNCContext } from './contexts/VNCContext'
import useEventBus from './hooks/useEventBus'
import Dashboard from './components/dashboard/Dashboard'
import BackendErrorDashboard from './components/dashboard/BackendErrorDashboard'


export function App() {
  const [loading, setLoading] = useState<boolean>(true)
  const ddClient = useMemo(createDockerDesktopClient, [])
  useEventBus(ddClient)
  const vnc = useVNC(ddClient)

  useEffect(() => {
    if (!vnc.sessionStore)
      ddClient.desktopUI.toast.error('Failed to connect to Backend service!')
  }, [vnc.sessionStore])

  useEffect(() => {
    vnc.reconnect().finally(() => setLoading(false))
  }, [])

  return (
    vnc.sessionStore
    ? <Box
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
              appLoading={loading || !vnc.sessionStore}
              disabled={vnc.state.current !== VNCState.READY}
            />

            <Divider />

            {
              vnc.state.current === VNCState.DISCONNECTING || !vnc.connectedData
               ? <Dashboard
                 appLoading={loading}
                 sessionStore={vnc.sessionStore}
               />
               : <VNCView
                 vnc={vnc}
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
    : <BackendErrorDashboard />
  )
}
