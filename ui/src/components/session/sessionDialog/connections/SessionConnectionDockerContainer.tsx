import { Autocomplete, FormGroup, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import React, { useEffect, useState } from 'react'
import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import VNCDockerContainer from '../../../../libs/vnc/connectionTypes/VNCDockerContainer'
import { ContainerInfo } from '../../../../types/docker/extension'
import ContainerSelect from '../../../connectbar/ContainerSelect'
import { serializeConnectionData } from '../SessionDialog'


interface DockerContainerProps {
  ddClient: DockerDesktopClient
  connection?: VNCDockerContainer
  setSubmitReady: (state: boolean)=>void
}

export interface ConnectionDataDockerContainer {
  container: string
  port: number
}


export function serializeConnectionDataDockerContainer(formData: FormData): ConnectionDataDockerContainer {
  function setData(connectionData: Partial<ConnectionDataDockerContainer>, key: string, value: FormDataEntryValue) {
    switch (key) {
      case 'container':
        connectionData.container = value as string
        break
      case 'port':
        connectionData.port = Number(value as string)
        break
    }

    return connectionData
  }

  return serializeConnectionData(formData, setData)
}


export default function SessionConnectionDockerContainer({ ddClient, connection, setSubmitReady }: DockerContainerProps) {
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
    setSubmitReady(selectedContainerName !== '' && selectedPort !== '')
  }, [selectedContainerName, selectedPort])

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

  function handleSelectedContainerNameChanged(name: string) {
    if (connection) return

    setSelectedContainerName(name)
  }

  function handleSelectedContainerPortChanged(port: string) {
    if (connection) return

    setSelectedPort(port)
  }

  return (
    <FormGroup>
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ContainerSelect
            containers={containers}
            disabled={connection !== undefined}
            selectedContainerName={selectedContainerName}
            setSelectedContainerName={handleSelectedContainerNameChanged}
          />
          <Tooltip title="Refresh Containerlist" arrow>
            <IconButton
              size="small"
              onClick={setRunningContainersState}
              disabled={connection !== undefined}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Autocomplete
          disabled={selectedContainerName === '' || connection !== undefined}
          options={selectedContainerPorts}
          renderInput={params => <TextField
            { ...params }
            label="Container internal port*"
            type="number"
            name="connectionData.port"
            slotProps={{ htmlInput: { ...params.inputProps, min: 1, max: 65535 } }}
          />}
          inputValue={selectedPort}
          onInputChange={(_, value) => handleSelectedContainerPortChanged(value)}
          onChange={(_, value) => handleSelectedContainerPortChanged(value?.toString() || '')}
          freeSolo
          sx={{
            width: '200px',
          }}
        />
      </Stack>
    </FormGroup>
  )
}
