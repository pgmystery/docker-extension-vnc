import { Autocomplete, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SessionList } from '../../types/session'


interface SessionSelectProps {
  sessions: SessionList
  disabled?: boolean
  selectedSessionName: string
  setSelectedSessionName: (name: string)=>void
  changeSelection: string | null
}


export default function SessionSelect({
  sessions,
  disabled,
  selectedSessionName,
  setSelectedSessionName,
  changeSelection,
}: SessionSelectProps) {
  const [value, setValue] = useState<string | null>(null)

  useEffect(() => {
    setValue(changeSelection)
  }, [changeSelection])

  return (
    <Autocomplete
      value={value}
      onChange={(_, value) => setValue(value)}
      disabled={disabled}
      options={ sessions.map(session => session.name) }
      renderInput={ params => <TextField { ...params } label="Sessions"/> }
      inputValue={selectedSessionName}
      onInputChange={(_, value) => setSelectedSessionName(value)}
      sx={ {width: 300} }
    />
  )
}
