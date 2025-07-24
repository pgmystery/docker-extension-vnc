import { FormControl, FormLabel, TextField, TextFieldProps } from '@mui/material'
import * as React from 'react'

interface SessionNameProps extends Omit<TextFieldProps, 'value'> {
  name: string
  setName: (name: string)=>void
  required?: boolean
}

export default function SessionName({ name, setName, required, ...props }: SessionNameProps) {
  return (
    <FormControl>
      <FormLabel required={required === undefined ? true : required}>Session Name</FormLabel>
      <TextField
        { ...props }
        name="name"
        value={name}
        onChange={e => setName(e.target.value)}
        required={required === undefined ? true : required}
        autoFocus
      />
    </FormControl>
  )
}
