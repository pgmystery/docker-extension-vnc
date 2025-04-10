import { Checkbox, FormControlLabel, Stack, TextField } from '@mui/material'
import { serializeConnectionData } from '../../../forms/SessionDataForm'
import { ConnectionDataDockerImage } from '../../../../../libs/vnc/connectionTypes/VNCDockerImage'
import { useState } from 'react'


interface DockerImageOptionsProps {
  connectionData?: Omit<ConnectionDataDockerImage, 'image' | 'imageTag'>
  required?: boolean
}

// export interface DockerImageConnectionDataOptions {
//   deleteContainerAfterDisconnect: boolean
// }

interface DockerImageOptionsData {
  port: number
  containerRunOptions: string
  containerRunArgs: string
  deleteContainerAfterDisconnect: boolean
}


export function serializeConnectionDataDockerImageOptions(formData: FormData) {
  function setData(connectionData: Partial<DockerImageOptionsData>, key: string, value: FormDataEntryValue) {
    switch (key) {
      case 'containerRunOptions':
        connectionData.containerRunOptions = value as string
        break
      case 'containerRunArgs':
        connectionData.containerRunArgs = value as string
        break
      case 'port':
        connectionData.port = Number(value as string)
        break
      case 'deleteContainerAfterDisconnect':
        connectionData.deleteContainerAfterDisconnect = true
        break
    }

    return connectionData
  }

  return serializeConnectionData(formData, setData)
}


export default function DockerImageOptions({ connectionData, required }: DockerImageOptionsProps) {
  const [containerRunOptions, setContainerRunOptions] = useState<string>(connectionData?.containerRunOptions || '')
  const [containerRunArgs, setContainerRunArgs] = useState<string>(connectionData?.containerRunArgs || '')
  const [vncPort, setVncPort] = useState<number>(connectionData?.port || 5900)
  const [deleteContainerAfterDisconnect, setDeleteContainerAfterDisconnect] = useState<boolean>(
    connectionData?.deleteContainerAfterDisconnect === undefined ? true : connectionData?.deleteContainerAfterDisconnect
  )

  return (
    <>
      <Stack direction="row" spacing={1}>
        <TextField
          label="Docker Container Run [OPTIONS]"
          name="connection.data.containerRunOptions"
          value={containerRunOptions}
          onChange={e => setContainerRunOptions(e.target.value)}
          sx={{
            width: '100%',
          }}
        />
        <TextField
          label="Docker Container Run [COMMAND] [ARG...]"
          name="connection.data.containerRunArgs"
          value={containerRunArgs}
          onChange={e => setContainerRunArgs(e.target.value)}
          sx={{
            width: '100%',
          }}
        />
      </Stack>
      <TextField
        name="connection.data.port"
        label="Container VNC PORT"
        type="number"
        slotProps={{ htmlInput: { min: 1, max: 65535 } }}
        value={vncPort}
        onChange={event => setVncPort(Number(event.target.value))}
        sx={{
          width: '200px',
        }}
        required={required === undefined ? true : required}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={deleteContainerAfterDisconnect}
            onChange={() => setDeleteContainerAfterDisconnect(!deleteContainerAfterDisconnect)}
            name="connection.data.deleteContainerAfterDisconnect"
          />
        }
        label="Remove Container after disconnect from the Session"
      />
    </>
  )
}
