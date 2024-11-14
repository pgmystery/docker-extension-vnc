import React, { useEffect, useMemo, useRef, useState } from 'react'
import Button from '@mui/material/Button';
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Autocomplete, FormControl, FormLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { VncScreen } from 'react-vnc'
import VNC from './libs/VNC'
import { Container } from './types/docker/extension'

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client
}

export function App() {
  const ddClient = useDockerDesktopClient()
  const vnc = useMemo(() => new VNC(), [ddClient])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState<string>('')
  const [containers, setContainers] = useState<Container[]>([])
  const [selectedContainerName, setSelectedContainerName] = useState<string>('')
  const [selectedContainerPorts] = useState<string[]>([])
  const [selectedPort, setSelectedPort] = useState<string>('')
  const vncScreenRef = useRef<React.ElementRef<typeof VncScreen>>(null)

  useEffect(() => {
    // INIT CONTAINERS
    async function setRunningContainersState() {
      const containers = await ddClient.docker.listContainers({
        filters: {
          status: ['running'],
        },
      }) as Container[]

      setContainers(containers)

      if (containers.length > 0) {
        console.log(containers)

        const container = containers[0]
        setSelectedContainerName(container.Names[0])

        if (container.Ports.length > 0) {
          setSelectedPort(container.Ports[0].PrivatePort.toString())
        }
      }
    }

    // TRY TO RECONNECT
    const tryToReconnect = async () => {
      const proxyContainer = await vnc.reconnect()
      setLoading(false)

      console.log('RECONNECT_PROXY_CONTAINER', proxyContainer)

      if (!proxyContainer) return

      setUrl(proxyContainer.url)

      console.log('RECONNECT_URL', proxyContainer.url)
    }

    setRunningContainersState()
    tryToReconnect()
  }, [])


  async function connectToContainer() {
    const selectedContainer = getContainerByName(selectedContainerName)

    if (!selectedContainer) return
    if (!vnc) return

    const proxyContainer = await vnc.connect(
      selectedContainer.Id,
      Number(selectedPort),
    )

    console.log('proxyContainer', proxyContainer)

    if (!proxyContainer) return

    setUrl(proxyContainer.url)

    console.log('URL', proxyContainer.url)
  }

  function selectedContainerChanged(name: string) {
    if (selectedContainerName !== name) {
      setSelectedContainerName(name)
      setSelectedPort('')
    }
  }

  function getContainerByName(name: string): Container | null {
    return containers.find(container => container.Names[0] == name) || null
  }

  return (
    <>
      <Stack alignItems="start" spacing={2}>
        <FormControl fullWidth>
          <FormLabel>Select a container to connect over VNC</FormLabel>
          <Stack direction="row" spacing={2}>
            <Select
              value={selectedContainerName}
              onChange={e => selectedContainerChanged(e.target.value)}
            >
              {
                containers.map((container) => (
                  <MenuItem key={container.Id} value={container.Names[0]}>{ container.Names[0] }</MenuItem>
                ))
              }
            </Select>
            <Autocomplete
              disabled={!selectedContainerName}
              options={selectedContainerPorts}
              renderInput={params => <TextField { ...params } key={params.id} />}
              inputValue={selectedPort}
              onInputChange={(_, value) => setSelectedPort(value)}
              onChange={(_, value) => setSelectedPort(value?.toString() || '')}
              freeSolo
            />
            <Button
              sx={{
                minWidth: '180px',
              }}
              disabled={!selectedContainerName && !loading}
              onClick={connectToContainer}
            >Connect</Button>
          </Stack>
        </FormControl>

        {
          loading || url === '' || !url
            ? <div>loading...</div>
            : <VncScreen
                url={url}
                scaleViewport
                style={{
                  width: '75vw',
                  height: '75vh',
                }}
                debug
                ref={vncScreenRef}
                rfbOptions={{
                  credentials: {
                    password: 'password',
                  },
                }}
              />
        }

      </Stack>
    </>
  )
}
