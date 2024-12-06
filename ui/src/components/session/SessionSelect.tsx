import { SessionList } from '../../api/routes/session'
import { Autocomplete, TextField } from '@mui/material'
import React from 'react'


interface SessionSelectProps {
  sessions: SessionList
  disabled?: boolean
  selectedSessionName: string
  setSelectedSessionName: (name: string)=>void
}


export default function SessionSelect({ sessions, disabled, selectedSessionName, setSelectedSessionName }: SessionSelectProps) {
  return (
    <Autocomplete
      disabled={disabled}
      options={ sessions.map(session => session.name) }
      renderInput={ params => <TextField { ...params } label="Sessions"/> }
      inputValue={selectedSessionName}
      onInputChange={(_, value) => setSelectedSessionName(value)}
      sx={ {width: 300} }
    />
  )
}
