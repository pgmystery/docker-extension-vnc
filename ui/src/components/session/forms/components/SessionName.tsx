import { FormControl, FormLabel, TextField, TextFieldProps } from '@mui/material'


interface SessionNameProps extends Omit<TextFieldProps, 'value'> {
  name: string
  setName: (name: string)=>void
  required?: boolean
  readonly?: boolean
}


export default function SessionName({ name, setName, required, readonly, ...props }: SessionNameProps) {
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
        disabled={readonly}
      />
    </FormControl>
  )
}
