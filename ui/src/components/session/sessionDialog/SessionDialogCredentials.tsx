import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { SessionCredentials } from '../../../types/session'


interface SessionDialogCredentialsProps{
  credentials?: SessionCredentials
}


export default function SessionDialogCredentials({ credentials }: SessionDialogCredentialsProps) {
  console.log('credentials', credentials)
  const [credentialsChecked, setCredentialsChecked] = useState<boolean>(!!credentials)
  const [username, setUsername] = useState<string>(credentials?.username || '')
  const [password, setPassword] = useState<string>(credentials?.password || '')

  useEffect(() => {
    if (!credentials) return

    if (credentials.username)
      setUsername(credentials.username)

    if (credentials.password)
      setPassword(credentials.password)
  }, [credentials])

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
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <TextField
          disabled={!credentialsChecked}
          name="password"
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </FormGroup>
    </FormControl>
  )
}
