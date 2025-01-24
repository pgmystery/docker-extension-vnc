import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField
} from '@mui/material'
import { VNCCredentials } from './VNCView'
import Button from '@mui/material/Button'
import { FormEvent } from 'react'
import { DialogProps } from '@toolpad/core'
import InputPassword from '../inputs/InputPassword'


interface VNCCredentialsDialogData extends VNCCredentials {
  save: boolean
}


export default function VNCCredentialsDialog({ open, onClose }: DialogProps<undefined, null | VNCCredentialsDialogData>) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries((formData as any).entries())

    const username = formJson.username
    const password = formJson.password
    const saveCredentials = formJson.hasOwnProperty('saveCredentials') && formJson.saveCredentials === 'on'

    onClose({
      username,
      password,
      save: saveCredentials,
    })
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
        }
      }}
    >
      <DialogTitle>VNC Session Credentials</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <TextField
            autoFocus
            name="username"
            label="Username"
            fullWidth
          />
          <InputPassword
            name="password"
            label="Password"
            fullWidth
          />
          <FormControlLabel control={<Checkbox name="saveCredentials" />} label="Save credentials (not encrypted)" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)}>Cancel</Button>
        <Button type="submit" color="success">OK</Button>
      </DialogActions>
    </Dialog>
  )
}
