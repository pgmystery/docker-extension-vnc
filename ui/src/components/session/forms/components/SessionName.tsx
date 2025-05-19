import { FormControl, FormLabel, TextField, TextFieldProps } from '@mui/material'

interface SessionNameProps extends Omit<TextFieldProps, 'value'> {
  name: string
  setName: (name: string)=>void
  required?: boolean
}

export default function SessionName({ name, setName, required }: SessionNameProps) {
  return (
    <FormControl>
      <FormLabel required={required === undefined ? true : required}>Session Name</FormLabel>
      <TextField
        name="name"
        value={name}
        onChange={e => setName(e.target.value)}
        required={required === undefined ? true : required}
        autoFocus
      />
    </FormControl>
  )
}
