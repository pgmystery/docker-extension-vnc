import { useState, MouseEvent } from 'react'
import { IconButton, InputAdornment, TextField, TextFieldProps, Tooltip } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'


export default function InputPassword(props: TextFieldProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  function handleClickShowPassword() {
    setShowPassword(prevState => !prevState)
  }

  function handleMouseDownPassword(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  function handleMouseUpPassword(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  return (
    <TextField
      { ...props }
      type={ showPassword ? 'text' : 'password' }
      slotProps={ {
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={showPassword ? 'Hide Password' : 'Show Password'} arrow>
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }
      }}
    />
  )
}
