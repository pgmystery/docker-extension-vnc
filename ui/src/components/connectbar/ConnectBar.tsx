import { Autocomplete, FormControl, FormLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { Container } from '../../types/docker/extension'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import ConnectButton from './ConnectButton'


export interface ConnectBarProps {
  onConnect: (containerId: string, targetPort: number)=>void
  onDisconnect: ()=>void
  connected?: ConnectBarConnectedData
  disabled?: boolean
}

export interface ConnectBarConnectedData {
  containerName: string
  port: number
}


export default function ConnectBar({ disabled, onConnect, onDisconnect, connected }: ConnectBarProps) {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const [containers, setContainers] = useState<Container[]>([])
  const [selectedContainerName, setSelectedContainerName] = useState<string>('')
  const [selectedContainerPorts] = useState<string[]>([])
  const [selectedPort, setSelectedPort] = useState<string>('')

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
        const container = containers[0]
        setSelectedContainerName(container.Names[0])

        if (container.Ports.length > 0) {
          setSelectedPort(container.Ports[0].PrivatePort.toString())
        }
      }
    }

    setRunningContainersState()
  }, [])

  function selectedContainerChanged(name: string) {
    if (selectedContainerName !== name) {
      setSelectedContainerName(name)
      setSelectedPort('')
    }
  }

  function getContainerByName(name: string): Container | null {
    return containers.find(container => container.Names[0] == name) || null
  }

  function handleConnectClicked() {
    const selectedContainer = getContainerByName(selectedContainerName)

    if (!selectedContainer) return

    onConnect(selectedContainer.Id, Number(selectedPort))
  }

  function handleDisconnectClicked() {
    onDisconnect()
  }

  return (
    <FormControl fullWidth>
      <FormLabel>Select a container to connect over VNC</FormLabel>
      <Stack direction="row" spacing={2}>
        <Select
          disabled={disabled || connected !== undefined}
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
          disabled={!selectedContainerName || disabled || connected !== undefined}
          options={selectedContainerPorts}
          renderInput={params => <TextField { ...params } key={params.id} />}
          inputValue={selectedPort}
          onInputChange={(_, value) => setSelectedPort(value)}
          onChange={(_, value) => setSelectedPort(value?.toString() || '')}
          freeSolo
        />
        <ConnectButton
          onConnect={handleConnectClicked}
          onDisconnect={handleDisconnectClicked}
          connected={connected !== undefined}
          disabled={disabled}
          sx={{
            minWidth: '180px',
          }}
        />
      </Stack>
    </FormControl>
  )
}
