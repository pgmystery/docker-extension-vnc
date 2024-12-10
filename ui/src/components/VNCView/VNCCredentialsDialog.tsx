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


export interface VNCCredentialsDialogProps {
  open: boolean
  onClose: ()=>void
  onSubmit: (credentials: VNCCredentials)=>void
}


export default function VNCCredentialsDialog({ open, onClose, onSubmit }: VNCCredentialsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault()

          const formData = new FormData(event.currentTarget)
          const formJson = Object.fromEntries((formData as any).entries())

          const username = formJson.username
          const password = formJson.password
          const saveCredentials = formJson.hasOwnProperty('saveCredentials') && formJson.saveCredentials === 'on'

          onSubmit({
            username,
            password,
            saveCredentials,
          })
        },
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
          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
          />
          <FormControlLabel control={<Checkbox name="saveCredentials" />} label="Save credentials (not encrypted)" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit">OK</Button>
      </DialogActions>
    </Dialog>
  )
}
