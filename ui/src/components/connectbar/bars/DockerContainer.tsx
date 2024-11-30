import { Autocomplete, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import ContainerSelect from '../ContainerSelect'
import ConnectButton from '../ConnectButton'
import React, { useEffect, useState } from 'react'
import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import { ContainerInfo } from '../../../types/docker/extension'
import VNCDockerContainer from '../../../libs/vnc/connectionTypes/VNCDockerContainer'
import { ConnectionData } from '../../../libs/vnc/VNC'


interface DockerContainerProps {
  ddClient: DockerDesktopClient
  connection?: VNCDockerContainer
  onConnect: (connectionData: ConnectionData)=>void
  onDisconnect: ()=>void
  disabled?: boolean
}


export default function DockerContainer({ ddClient, disabled, onConnect, onDisconnect, connection }: DockerContainerProps) {
  const [containers, setContainers] = useState<ContainerInfo[]>([])
  const [selectedContainerName, setSelectedContainerName] = useState<string>('')
  const [selectedContainerPorts, setSelectedContainerPorts] = useState<string[]>([])
  const [selectedPort, setSelectedPort] = useState<string>('')

  useEffect(() => {
    // INIT CONTAINERS
    setRunningContainersState()
  }, [])

  useEffect(() => {
    setSelectedPort(connection?.target.connection?.port.toString() || '')

    const selectedContainer = getContainerByName(selectedContainerName)

    setSelectedContainerPorts(selectedContainer?.Ports.map(portInfo => portInfo.PrivatePort.toString()) || [])
  }, [selectedContainerName])

  useEffect(() => {
    if (!connection || !connection.target.connection) {
      setRunningContainersState()

      return
    }

    const targetContainerName = connection.target.getContainerName()
    const targetPort = connection.target.connection.port.toString()

    if (selectedContainerName !== targetContainerName)
      setSelectedContainerName(targetContainerName || '')

    const portString = targetPort.toString()
    if (selectedPort !== portString)
      setSelectedPort(portString)
  }, [connection])

  async function setRunningContainersState() {
    const containers = await ddClient.docker.listContainers({
      filters: {
        status: ['running'],
      },
    }) as ContainerInfo[]

    setContainers(containers)

    if (!connection || !connection.target.connection) return

    const targetContainerName = connection.target.getContainerName() || ''
    const targetPort = connection.target.connection.port

    containers.forEach(container => {
      if (container.Names.includes(targetContainerName)) {
        setSelectedContainerName(targetContainerName)

        if (container.Ports.some(containerPort => containerPort.PrivatePort === targetPort))
          setSelectedPort(targetPort.toString())
      }
    })
  }

  function getContainerByName(name: string): ContainerInfo | null {
    return containers.find(container => container.Names[0] == name) || null
  }

  function handleConnectClicked() {
    const selectedContainer = getContainerByName(selectedContainerName)

    if (!selectedContainer) return

    onConnect({
      type: 'container',
      data: {
        targetContainerId: selectedContainer.Id,
        targetPort: Number(selectedPort)
      }
    })
  }

  function handleDisconnectClicked() {
    onDisconnect()
  }

  function handleSelectedContainerNameChanged(name: string) {
    if (connection) return

    setSelectedContainerName(name)
  }

  function handleSelectedContainerPortChanged(port: string) {
    if (connection) return

    setSelectedPort(port)
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Tooltip title="Refresh Containerlist" arrow>
          <IconButton
            size="small"
            onClick={setRunningContainersState}
            disabled={disabled || connection !== undefined}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <ContainerSelect
          containers={containers}
          disabled={disabled || connection !== undefined}
          selectedContainerName={selectedContainerName}
          setSelectedContainerName={handleSelectedContainerNameChanged}
        />
      </Stack>
      <Autocomplete
        disabled={selectedContainerName === '' || disabled || connection !== undefined}
        options={selectedContainerPorts}
        renderInput={params => <TextField
          { ...params }
          label="Container internal port"
          type="number"
          slotProps={{ htmlInput: { ...params.inputProps, min: 1, max: 65535 } }}
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
        connected={connection !== undefined}
        connectButtonDisabled={selectedContainerName === '' || selectedPort === '' || disabled}
        disconnectButtonDisabled={disabled}
        sx={{
          minWidth: '180px',
        }}
      />
    </>
  )
}
