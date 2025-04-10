import { styled, TextareaAutosize, TextField } from '@mui/material'

interface ClipboardFieldProps {
  value: string
  setValue: (value: string)=>void
  isPassword?: boolean
  autoFocus?: boolean
}

export default function ClipboardField({ isPassword, autoFocus, value, setValue }: ClipboardFieldProps) {

  if (isPassword) {
    return (
      <TextField
        autoFocus={autoFocus}
        type="password"
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
      />
    )
  }
  else {
    return (
      <Textarea
        autoFocus={autoFocus}
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
      />
    )
  }
}

const Textarea = styled(TextareaAutosize)(() => `
  min-height: 50px;
`)
