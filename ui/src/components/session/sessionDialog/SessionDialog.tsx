import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Divider,
  FormControl,
  FormLabel,
  Stack,
  TextField
} from '@mui/material'
import { FormEvent, ReactNode, useState } from 'react'
import Button from '@mui/material/Button'
import SessionDialogConnection from './SessionDialogConnection'
import { Session } from '../../../types/session'
import SessionDialogCredentials from './SessionDialogCredentials'
import { SessionCreateData } from '../../../api/routes/session'
import { serializeConnectionDataRemoteHost } from './connections/SessionConnectionRemoteHost'
import { serializeConnectionDataDockerContainer } from './connections/SessionConnectionDockerContainer'


interface SessionDialogProps {
  open: boolean
  close: ()=>void
  title: string
  session?: Session
  submitButtonText: string
  onSubmit: (session: SessionCreateData)=>void
  children?: ReactNode
}


export function serializeConnectionData<T extends {}>(formData: FormData, setData: (connectionData: Partial<T>, key: string, value: FormDataEntryValue)=>Partial<T>) {
  return Array.from(formData).reduce((previousValue, currentValue) => {
    const [itemGroup, itemValue] = currentValue
    const itemNames = itemGroup.split('.')

    if (itemNames[0] === 'connectionData') {
      previousValue = setData(previousValue, itemNames[1], itemValue)
    }

    return previousValue
  }, {} as Partial<T>) as T
}


export default function SessionDialog({ open, close, title, session, submitButtonText, onSubmit, children }: SessionDialogProps) {
  const [sessionName, setSessionName] = useState<string>(session?.name || '')
  const [connectionTypeReady, setConnectionTypeReady] = useState<boolean>(false)

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth={true}
      PaperProps={{
        component: 'form',
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)

          const formJson = Array.from(formData).reduce((previousValue, currentValue) => {
            const [itemGroup, itemValue] = currentValue

            if (itemGroup.startsWith('connectionData'))
              return previousValue

            // @ts-ignore
            previousValue[itemGroup] = itemValue

            return previousValue
          }, {
            connectionData: null
          } as unknown) as Partial<SessionCreateData>

          switch (formJson.connectionType) {
            case 'remote':
              formJson.connectionData = serializeConnectionDataRemoteHost(formData)
              break
            case 'container':
              formJson.connectionData = serializeConnectionDataDockerContainer(formData)
              break
          }

          console.log(formJson)

          onSubmit(formJson as SessionCreateData)
          close()
        },
      }}
    >
     <DialogTitle>{ title }</DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={1}>
          <TextField type="hidden" name="id" value={session?.id} sx={{display: 'none'}} disabled/>
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
            setSubmitReady={setConnectionTypeReady}
          />
          <Divider />
          <SessionDialogCredentials />
          { children }
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={close}>Close</Button>
        <Button
          color="success"
          disabled={sessionName === '' || !connectionTypeReady}
          type="submit"
        >{ submitButtonText }</Button>
      </DialogActions>
    </Dialog>
  )
}
