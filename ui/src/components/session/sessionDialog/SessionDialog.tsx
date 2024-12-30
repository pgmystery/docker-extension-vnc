import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Divider,
  IconButton,
} from '@mui/material'
import { FormEvent, useState } from 'react'
import Button from '@mui/material/Button'
import { Session, SessionCreateData } from '../../../types/session'
import CloseIcon from '@mui/icons-material/Close'
import { DialogProps } from '@toolpad/core'
import SessionDataForm, { serializeSessionFormData } from '../forms/SessionDataForm'


export interface SessionDialogProps {
  title: string
  submitButtonText: string
  session?: Session
}


export default function SessionDialog({ open, onClose, payload }: DialogProps<SessionDialogProps, null | SessionCreateData>) {
  const { title, submitButtonText, session } = payload
  const [sessionDataFormReady, setSessionDataFormReady] = useState<boolean>(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const sessionFormDataJson = serializeSessionFormData(formData)

    onClose(sessionFormDataJson)
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      maxWidth="sm"
      fullWidth={true}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>{ title }</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => onClose(null)}
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
        <SessionDataForm session={session} onReady={state => setSessionDataFormReady(state)} />
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={() => onClose(null)}>Close</Button>
        <Button
          color="success"
          disabled={!sessionDataFormReady}
          type="submit"
        >{ submitButtonText }</Button>
      </DialogActions>
    </Dialog>
  )
}
