import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { SessionCredentials } from '../../../types/session'
import InputPassword from '../../inputs/InputPassword'


interface SessionDialogCredentialsProps{
  credentials?: SessionCredentials
}


export function serializeCredentials(formData: FormData): SessionCredentials {
  const credentials: SessionCredentials = {
    username: '',
    password: '',
  }

  return Array.from(formData).reduce((previousValue, currentValue) => {
    const [itemGroup, itemValue] = currentValue
    const itemNames = itemGroup.split('.')

    if (itemNames[0] === 'credentials') {
      switch (itemNames[1]) {
        case 'username':
          previousValue.username = itemValue.toString()

          break

        case 'password':
          previousValue.password = itemValue.toString()

          break
      }
    }

    return previousValue
  }, credentials)
}


export default function SessionDialogCredentials({ credentials }: SessionDialogCredentialsProps) {
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
        />} label="Save Credentials (not encrypted)" />
        <TextField
          disabled={!credentialsChecked}
          name="credentials.username"
          label="Username"
          fullWidth
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <InputPassword
          disabled={!credentialsChecked}
          name="credentials.password"
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
