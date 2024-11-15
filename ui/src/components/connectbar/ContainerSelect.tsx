import { Autocomplete, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Container } from '../../types/docker/extension'


export interface ContainerSelectProps {
  containers: Container[]
  disabled?: boolean
}


export default function ContainerSelect({ containers, disabled }: ContainerSelectProps) {
  const [containerNames, setContainerNames] = useState<string[]>([])
  const [selectedContainerName, setSelectedContainerName] = useState<string>('')

  useEffect(() => {
    setContainerNames(containers.map(container => container.Names[0]))
  }, [containers])

  return (
    <Autocomplete
      disabled={disabled}
      options={containerNames}
      renderInput={params => <TextField { ...params } key={params.id} />}
      inputValue={selectedContainerName}
      onInputChange={(_, value) => setSelectedContainerName(value)}
      onChange={(_, value) => setSelectedContainerName(value || '')}
    />
  )
}
