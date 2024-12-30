import { Divider, FormControl, FormLabel, Stack, TextField } from '@mui/material'
import SessionDialogConnection from '../sessionDialog/SessionDialogConnection'
import SessionDialogCredentials, { serializeCredentials } from '../sessionDialog/SessionDialogCredentials'
import { ReactNode, useEffect, useState } from 'react'
import { Session, SessionCreateData } from '../../../types/session'
import { serializeConnectionDataRemoteHost } from '../sessionDialog/connections/SessionConnectionRemoteHost'
import { serializeConnectionDataDockerContainer } from '../sessionDialog/connections/SessionConnectionDockerContainer'


interface SessionDataFormProps {
  session?: Session
  onReady?: (state: boolean)=>void
  children?: ReactNode
}


export function serializeConnectionData<T extends {}>(formData: FormData, setData: (connectionData: Partial<T>, key: string, value: FormDataEntryValue)=>Partial<T>) {
  return Array.from(formData).reduce((previousValue, currentValue) => {
    const [itemGroup, itemValue] = currentValue
    const itemNames = itemGroup.split('.')

    if (itemNames[0] === 'connection' && itemNames[1] === 'data') {
      previousValue = setData(previousValue, itemNames[2], itemValue)
    }

    return previousValue
  }, {} as Partial<T>) as T
}


export function serializeSessionFormData(formData: FormData) {
  const formJson = Array.from(formData).reduce((previousValue, currentValue) => {
    const [itemGroup, itemValue] = currentValue

    if (itemGroup.startsWith('connection')) {
      if (itemGroup === 'connection.type') {
        // @ts-ignore
        previousValue.connection = {
          type: itemValue,
        }
      }

      return previousValue
    }

    else if (itemGroup.startsWith('credentials')) {
      if (itemGroup === 'credentials' && itemValue === 'on') {
        // @ts-ignore
        previousValue.credentials = serializeCredentials(formData)
      }

      return previousValue
    }

    // @ts-ignore
    previousValue[itemGroup] = itemValue

    return previousValue
  }, {} as unknown) as Partial<SessionCreateData>

  switch (formJson.connection?.type) {
    case 'remote':
      formJson.connection.data = serializeConnectionDataRemoteHost(formData)
      break
    case 'container':
      formJson.connection.data = serializeConnectionDataDockerContainer(formData)
      break
  }

  return formJson as SessionCreateData
}


export default function SessionDataForm({ session, onReady, children }: SessionDataFormProps) {
  const [sessionName, setSessionName] = useState<string>(session?.name || '')
  const [connectionReady, setConnectionReady] = useState<boolean>(false)

  useEffect(() => {
    if (!onReady)
      return

    onReady(sessionName !== '' && connectionReady)
  }, [sessionName, connectionReady])

  return (
    <Stack spacing={1}>
      <TextField type="hidden" name="id" value={session?.id || ''} sx={{display: 'none'}} disabled/>
      {/* Session name */}
      <FormControl>
        <FormLabel required>Session Name</FormLabel>
        <TextField
          name="name"
          value={sessionName}
          onChange={e => setSessionName(e.target.value)}
          required
          autoFocus
        />
      </FormControl>
      <Divider />
      <SessionDialogConnection
        setSubmitReady={setConnectionReady}
        connection={session?.connection}
      />
      <Divider />
      <SessionDialogCredentials
        credentials={session?.credentials}
      />
      { children }
    </Stack>
  )
}
