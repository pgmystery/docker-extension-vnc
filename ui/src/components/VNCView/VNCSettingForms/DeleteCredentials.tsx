import { FormControl, FormLabel, Button } from '@mui/material'
import { useEffect, useState } from 'react'


export default function DeleteCredentials() {
  const [credentialsSaved, setCredentialsSaved] = useState<boolean>(false)

  useEffect(() => {
    if (localStorage.getItem('credentials')) setCredentialsSaved(true)
  }, [])

  function deleteCredentialsFromLocalStorage() {
    localStorage.removeItem('credentials')
    setCredentialsSaved(false)
  }

  return (
    <FormControl>
      <FormLabel>Delete saved credentials from local storage</FormLabel>
      <Button
        onClick={deleteCredentialsFromLocalStorage}
        color="error"
        sx={{
          width: '200px'
        }}
        disabled={!credentialsSaved}
      >Delete saved credentials</Button>
    </FormControl>
  )
}
