import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Tooltip
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import React, { useEffect, useState } from 'react'
import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import { ContainerInfo } from '../../../../types/docker/extension'
import ContainerSelect from '../../../inputs/docker/ContainerSelect'
import { serializeConnectionData } from '../../forms/SessionDataForm'
import {
  ConnectionDataDockerContainer
} from '../../../../libs/vnc/connectionTypes/VNCDockerContainer/VNCDockerContainerBase'


interface DockerContainerProps {
  ddClient: DockerDesktopClient
  connectionData?: ConnectionDataDockerContainer
  setSubmitReady: (state: boolean)=>void
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
      case 'stopContainerAfterDisconnect':
        connectionData.stopAfterDisconnect = true
        break
    }

    return connectionData
  }

  return serializeConnectionData(formData, setData)
}


export default function SessionConnectionDockerContainer({ ddClient, connectionData, setSubmitReady }: DockerContainerProps) {
  const [containers, setContainers] = useState<ContainerInfo[]>([])
  const [selectedContainerName, setSelectedContainerName] = useState<string>(connectionData?.container || '')
  const [selectedContainerPorts, setSelectedContainerPorts] = useState<string[]>([])
  const [selectedPort, setSelectedPort] = useState<string>('')
  const [stopContainer, setStopContainer] = useState<boolean>(connectionData?.stopAfterDisconnect || false)

  useEffect(() => {
    // INIT CONTAINERS
    setRunningContainersState()
  }, [])

  useEffect(() => {
    setSelectedPort('')
    if (selectedContainerName === connectionData?.container)
      setSelectedPort(connectionData?.port.toString() || '')

    const selectedContainer = getContainerByName(selectedContainerName)

    setSelectedContainerPorts(selectedContainer?.Ports?.map(portInfo => portInfo.PrivatePort.toString()) || [])
  }, [selectedContainerName])

  useEffect(() => {
    setSubmitReady(selectedContainerName !== '' && selectedPort !== '')
  }, [selectedContainerName, selectedPort])

  useEffect(() => {
    if (!connectionData) {
      setRunningContainersState()

      return
    }

    const targetContainerName = connectionData.container
    const targetPort = connectionData.port.toString()

    if (selectedContainerName !== targetContainerName)
      setSelectedContainerName(targetContainerName || '')

    const portString = targetPort.toString()
    if (selectedPort !== portString)
      setSelectedPort(portString)
  }, [connectionData])

  async function setRunningContainersState() {
    const containers = await ddClient.docker.listContainers({
      filters: {
        status: ['running'],
      },
    }) as ContainerInfo[]

    setContainers(containers)

    if (!connectionData) return

    const targetContainerName = connectionData.container || ''
    const targetPort = connectionData.port

    containers.forEach(container => {
      if (container.Names.includes(targetContainerName)) {
        setSelectedContainerName(targetContainerName)

        if (container.Ports?.some(containerPort => containerPort.PrivatePort === targetPort))
          setSelectedPort(targetPort.toString())
      }
    })
  }

  function getContainerByName(name: string): ContainerInfo | null {
    return containers.find(container => container.Names[0] == name) || null
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
            selectedContainerName={selectedContainerName}
            setSelectedContainerName={setSelectedContainerName}
            dockerClient={ddClient.docker}
          />
          <Tooltip title="Refresh Containerlist" arrow>
            <IconButton
              size="small"
              onClick={setRunningContainersState}
              sx={{
                alignSelf: 'start',
                marginTop: '2px',
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Autocomplete
          disabled={selectedContainerName === ''}
          options={selectedContainerPorts}
          renderInput={params => <TextField
            { ...params }
            label="VNC-Server PORT*"
            type="number"
            name="connection.data.port"
            slotProps={{ htmlInput: { ...params.inputProps, min: 1, max: 65535 } }}
          />}
          inputValue={selectedPort}
          onInputChange={(_, value) => setSelectedPort(value)}
          onChange={(_, value) => setSelectedPort(value?.toString() || '')}
          freeSolo
          sx={{
            width: '200px',
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={stopContainer}
              onChange={() => setStopContainer(!stopContainer)}
              name="connection.data.stopContainerAfterDisconnect"
            />
          }
          label="Stop Container after disconnect"
        />
      </Stack>
    </FormGroup>
  )
}
