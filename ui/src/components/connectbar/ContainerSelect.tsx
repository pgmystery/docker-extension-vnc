import { Autocomplete, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Container } from '../../types/docker/extension'


export interface ContainerSelectProps {
  containers: Container[]
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
      disabled={disabled}
      options={containerNames}
      renderInput={params => <TextField { ...params } label="Docker Container" />}
      inputValue={selectedContainerName}
      onInputChange={(_, value) => setSelectedContainerName(value)}
      sx={{ width: 300 }}
    />
  )
}
