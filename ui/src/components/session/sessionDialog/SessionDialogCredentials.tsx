import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, TextField } from '@mui/material'
import { useState } from 'react'
import { SessionCredentials } from '../../../types/session'


interface SessionDialogCredentialsProps{
  credentials?: SessionCredentials
}


export default function SessionDialogCredentials({ credentials }: SessionDialogCredentialsProps) {
  const [credentialsChecked, setCredentialsChecked] = useState<boolean>(!!credentials)

  return (
    <FormControl>
      <FormLabel>Credentials</FormLabel>
      <FormGroup>
        <FormControlLabel control={<Checkbox
          name="credentials"
          checked={credentialsChecked}
          onChange={e => setCredentialsChecked(e.target.checked)}
          inputProps={{ 'aria-label': 'controlled' }}
        />} label="Save Credentials" />
        <TextField
          disabled={!credentialsChecked}
          name="username"
          label="Username"
          fullWidth
        />
        <TextField
          disabled={!credentialsChecked}
          name="password"
          label="Password"
          type="password"
          fullWidth
        />
      </FormGroup>
    </FormControl>
  )
}
