import { Autocomplete, FormControl, FormLabel, Stack, TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { Container } from '../../types/docker/extension'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import ConnectButton from './ConnectButton'
import ContainerSelect from './ContainerSelect'


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
  const [selectedContainerPorts, setSelectedContainerPorts] = useState<string[]>([])
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

  useEffect(() => {
    setSelectedPort('')
    const selectedContainer = getContainerByName(selectedContainerName)

    setSelectedContainerPorts(selectedContainer?.Ports.map(portInfo => portInfo.PrivatePort.toString()) || [])
  }, [selectedContainerName])

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
        <ContainerSelect
          containers={containers}
          disabled={disabled || connected !== undefined}
          selectedContainerName={selectedContainerName}
          setSelectedContainerName={setSelectedContainerName}
        />
        <Autocomplete
          disabled={selectedContainerName === '' || disabled || connected !== undefined}
          options={selectedContainerPorts}
          renderInput={params => <TextField { ...params } label="Container internal port" />}
          inputValue={selectedPort}
          onInputChange={(_, value) => setSelectedPort(value)}
          onChange={(_, value) => setSelectedPort(value?.toString() || '')}
          freeSolo
          sx={{ width: 300 }}
        />
        <ConnectButton
          onConnect={handleConnectClicked}
          onDisconnect={handleDisconnectClicked}
          connected={connected !== undefined}
          disabled={selectedContainerName === '' || selectedPort === '' || disabled}
          sx={{
            minWidth: '180px',
          }}
        />
      </Stack>
    </FormControl>
  )
}
