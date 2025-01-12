import { Autocomplete, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SessionList } from '../../types/session'


interface SessionSelectProps {
  sessions: SessionList
  disabled?: boolean
  selectedSessionName: string
  setSelectedSessionName: (name: string)=>void
}

interface SessionSelectOption {
  firstLetter: string
  name: string
}


export default function SessionSelect({
  sessions,
  disabled,
  selectedSessionName,
  setSelectedSessionName,
}: SessionSelectProps) {
  const [value, setValue] = useState<SessionSelectOption | null>(null)
  const options = sessions.map(option => getOptionFromSessionName(option.name) as SessionSelectOption)

  useEffect(() => {
    if (value?.name !== selectedSessionName)
      setValue(getOptionFromSessionName(selectedSessionName))
  }, [selectedSessionName])

  function getOptionFromSessionName(sessionName?: string | null): SessionSelectOption | null {
    if (!sessionName) return null

    const firstLetter = sessionName[0]

    return {
      firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
      name: sessionName,
    }
  }

  return (
    <Autocomplete
      value={value}
      onChange={(_, value) => setSelectedSessionName(value?.name || '')}
      disabled={disabled}
      options={ options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter)) }
      getOptionLabel={(option) => option.name}
      renderInput={ params => <TextField { ...params } label="Sessions"/> }
      inputValue={selectedSessionName}
      groupBy={(option) => option.firstLetter.toUpperCase()}
      noOptionsText="No Sessions"
      sx={ {width: 300} }
    />
  )
}
