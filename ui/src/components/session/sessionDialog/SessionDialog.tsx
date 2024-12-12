import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Divider,
  FormControl,
  FormLabel, IconButton,
  Stack,
  TextField
} from '@mui/material'
import { FormEvent, ReactNode, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import SessionDialogConnection from './SessionDialogConnection'
import { Session, SessionCreateData } from '../../../types/session'
import SessionDialogCredentials, { serializeCredentials } from './SessionDialogCredentials'
import { serializeConnectionDataRemoteHost } from './connections/SessionConnectionRemoteHost'
import { serializeConnectionDataDockerContainer } from './connections/SessionConnectionDockerContainer'
import CloseIcon from '@mui/icons-material/Close'


export interface SessionDialogProps {
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

    if (itemNames[0] === 'connection' && itemNames[1] === 'data') {
      previousValue = setData(previousValue, itemNames[2], itemValue)
    }

    return previousValue
  }, {} as Partial<T>) as T
}


export default function SessionDialog({ open, close, title, session, submitButtonText, onSubmit, children }: SessionDialogProps) {
  const [sessionName, setSessionName] = useState<string>(session?.name || '')
  const [connectionTypeReady, setConnectionTypeReady] = useState<boolean>(false)

  useEffect(() => {
    if (!session) return

    setSessionName(session.name)
  }, [session])

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

          onSubmit(formJson as SessionCreateData)
          close()
        },
      }}
    >
      <DialogTitle>{ title }</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={close}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <Divider />
      <DialogContent>
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
            setSubmitReady={setConnectionTypeReady}
            connection={session?.connection}
          />
          <Divider />
          <SessionDialogCredentials
            credentials={session?.credentials}
          />
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
