import { Autocomplete, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ContainerInfo } from '../../types/docker/extension'


export interface ContainerSelectProps {
  containers: ContainerInfo[]
  disabled?: boolean
  selectedContainerName: string
  setSelectedContainerName: (name: string)=>void
}


export default function ContainerSelect({ containers, disabled, selectedContainerName, setSelectedContainerName }: ContainerSelectProps) {
  const [containerNames, setContainerNames] = useState<string[]>([])

  useEffect(() => {
    setContainerNames(containers.map(container => container.Names[0]))
  }, [containers])

  return (
    <Autocomplete
      fullWidth
      freeSolo
      disabled={disabled}
      options={containerNames}
      renderInput={params => <TextField { ...params } label="Docker Container Name/ID*" name="connection.data.container" />}
      inputValue={selectedContainerName}
      onInputChange={(_, value) => setSelectedContainerName(value)}
    />
  )
}
