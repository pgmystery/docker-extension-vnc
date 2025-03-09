import { Checkbox, FormControlLabel, FormGroup, Stack, TextField, Typography } from '@mui/material'
import DockerImageSearchInput from '../../../inputs/docker/DockerImageSearchInput'
import DockerImageSearchTagInput from '../../../inputs/docker/DockerImageSearchTagInput'
import React, { useEffect, useState } from 'react'
import { serializeConnectionData } from '../../forms/SessionDataForm'


interface DockerImageProps {
  connectionData?: ConnectionDataDockerImage
  setSubmitReady: (state: boolean)=>void
}

export interface ConnectionDataDockerImage {
  port: number
  image: string
  imageTag: string
  containerRunOptions: string
  containerRunArgs: string
  deleteContainerAfterDisconnect: boolean
}


export function serializeConnectionDataDockerImage(formData: FormData): ConnectionDataDockerImage {
  function setData(connectionData: Partial<ConnectionDataDockerImage>, key: string, value: FormDataEntryValue) {
    switch (key) {
      case 'port':
        connectionData.port = Number(value as string)
        break
      case 'image':
        connectionData.image = value as string
        break
      case 'imageTag':
        connectionData.imageTag = value as string
        break
      case 'containerRunOptions':
        connectionData.containerRunOptions = value as string
        break
      case 'containerRunArgs':
        connectionData.containerRunArgs = value as string
        break
      case 'deleteContainerAfterDisconnect':
        connectionData.deleteContainerAfterDisconnect = true
        break
    }

    return connectionData
  }

  return serializeConnectionData(formData, setData)
}


export default function SessionConnectionDockerImage({ connectionData, setSubmitReady }: DockerImageProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(connectionData?.image || undefined)
  const [imageTag, setImageTag] = useState<string>(connectionData?.imageTag || '')
  const [isImageTagValid, setIsImageTagValid] = useState<boolean>(connectionData?.imageTag !== '')
  const [containerRunOptions, setContainerRunOptions] = useState<string>(connectionData?.containerRunOptions || '')
  const [containerRunArgs, setContainerRunArgs] = useState<string>(connectionData?.containerRunArgs || '')
  const [vncPort, setVncPort] = useState<number>(connectionData?.port || 5900)
  const [deleteContainerAfterDisconnect, setDeleteContainerAfterDisconnect] = useState<boolean>(connectionData?.deleteContainerAfterDisconnect || false)

  useEffect(() => {
    setSubmitReady(selectedImage != '' && isImageTagValid)
  }, [selectedImage, isImageTagValid])

  return (
    <FormGroup>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <DockerImageSearchInput
            setSelectedImage={setSelectedImage}
            initSelectedImage={selectedImage}
          />
          <Typography fontSize="2rem">:</Typography>
          <DockerImageSearchTagInput
            repository={selectedImage}
            tag={imageTag}
            setTag={setImageTag}
            onTagIsValidChange={setIsImageTagValid}
          />
        </Stack>
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
          required
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
      </Stack>
    </FormGroup>
  )
}
