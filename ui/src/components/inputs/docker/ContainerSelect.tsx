import { Autocomplete, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ContainerInfo } from '../../../types/docker/extension'
import DockerCli from '../../../libs/docker/DockerCli'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { BaseTextFieldProps } from '@mui/material/TextField/TextField'


export interface ContainerSelectProps {
  containers: ContainerInfo[]
  disabled?: boolean
  selectedContainerName: string
  setSelectedContainerName: (name: string)=>void
  dockerClient: Docker
}


export default function ContainerSelect({ containers, disabled, selectedContainerName, setSelectedContainerName, dockerClient }: ContainerSelectProps) {
  const [containerNames, setContainerNames] = useState<string[]>([])
  const [initContainerExistColor, setInitContainerExistColor] = useState<BaseTextFieldProps['color']>('primary')

  useEffect(() => {
    if (!selectedContainerName) return

    const dockerCli = new DockerCli(dockerClient)

    dockerCli.inspect(selectedContainerName)
             .then(() => setInitContainerExistColor('success'))
             .catch(() => setInitContainerExistColor('error'))
  }, [])

  useEffect(() => {
    setContainerNames(containers.map(container => container.Names[0]))
  }, [containers])

  function handleInputChange(_: any, value: string) {
    setSelectedContainerName(value)
    setInitContainerExistColor('primary')
  }

  return (
    <Autocomplete
      fullWidth
      freeSolo
      disabled={disabled}
      options={containerNames}
      renderInput={params => <TextField
        { ...params }
        label="Docker Container Name/ID*"
        name="connection.data.container"
        color={initContainerExistColor}
        error={initContainerExistColor === 'error'}
        helperText={initContainerExistColor === 'error' && 'No Container found with this Name/ID.'}
      />}
      inputValue={selectedContainerName}
      onInputChange={handleInputChange}
    />
  )
}
