import { Autocomplete, FormControl, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { Container } from '../../types/docker/extension'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import ConnectButton from './ConnectButton'
import ContainerSelect from './ContainerSelect'
import RefreshIcon from '@mui/icons-material/Refresh'


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
    setRunningContainersState()
  }, [])

  useEffect(() => {
    connected
      ? setSelectedPort(connected.port.toString())
      : setSelectedPort('')

    const selectedContainer = getContainerByName(selectedContainerName)

    setSelectedContainerPorts(selectedContainer?.Ports.map(portInfo => portInfo.PrivatePort.toString()) || [])
  }, [selectedContainerName])

  useEffect(() => {
    if (!connected) {
      setRunningContainersState()

      return
    }

    const { containerName, port } = connected

    if (selectedContainerName !== containerName)
      setSelectedContainerName(containerName)

    const portString = port.toString()
    if (selectedPort !== portString)
      setSelectedPort(portString)
  }, [connected])

  async function setRunningContainersState() {
    const containers = await ddClient.docker.listContainers({
      filters: {
        status: ['running'],
      },
    }) as Container[]

    setContainers(containers)

    if (!connected) return

    const { containerName, port } = connected

    containers.forEach(container => {
      if (container.Names.includes(containerName)) {
        setSelectedContainerName(containerName)

        if (container.Ports.some(containerPort => containerPort.PrivatePort === port))
          setSelectedPort(port.toString())
      }
    })
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

  function handleSelectedContainerNameChanged(name: string) {
    if (connected) return

    setSelectedContainerName(name)
  }

  function handleSelectedContainerPortChanged(port: string) {
    if (connected) return

    setSelectedPort(port)
  }

  return (
    <FormControl fullWidth>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          flexFlow: 'wrap',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tooltip title="Refresh Containerlist" arrow>
            <IconButton
              size="small"
              onClick={setRunningContainersState}
              disabled={disabled || connected !== undefined}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <ContainerSelect
            containers={containers}
            disabled={disabled || connected !== undefined}
            selectedContainerName={selectedContainerName}
            setSelectedContainerName={handleSelectedContainerNameChanged}
          />
        </Stack>
        <Autocomplete
          disabled={selectedContainerName === '' || disabled || connected !== undefined}
          options={selectedContainerPorts}
          renderInput={params => <TextField
            { ...params }
            label="Container internal port"
            type="number"
            slotProps={{ htmlInput: { ...params.inputProps, min: 0, max: 65535 } }}
          />}
          inputValue={selectedPort}
          onInputChange={(_, value) => handleSelectedContainerPortChanged(value)}
          onChange={(_, value) => handleSelectedContainerPortChanged(value?.toString() || '')}
          freeSolo
          sx={{ width: '175px' }}
        />
        <ConnectButton
          onConnect={handleConnectClicked}
          onDisconnect={handleDisconnectClicked}
          connected={connected !== undefined}
          connectButtonDisabled={selectedContainerName === '' || selectedPort === '' || disabled}
          disconnectButtonDisabled={disabled}
          sx={{
            minWidth: '180px',
          }}
        />
      </Stack>
    </FormControl>
  )
}
