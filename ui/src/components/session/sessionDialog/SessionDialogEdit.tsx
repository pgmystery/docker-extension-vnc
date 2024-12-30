import { SessionDialogProps } from './SessionDialog'
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { FormEvent, useEffect, useState } from 'react'
import { Session, SessionItem, SessionUpdateData } from '../../../types/session'
import Button from '@mui/material/Button'
import SessionDialogDelete from './SessionDialogDelete'
import { DialogProps, useDialogs } from '@toolpad/core'
import SessionDataForm, { serializeSessionFormData } from '../forms/SessionDataForm'
import BackdropContainer from '../../utils/BackdropContainer'


interface SessionDialogEditProps extends Omit<SessionDialogProps, 'open' | 'onSubmit'> {
  editSession: SessionItem
}

interface SessionDialogEditReturnUpdate {
  type: 'update'
  data: SessionUpdateData
}

interface SessionDialogEditReturnDelete {
  type: 'delete'
  data: string
}

type SessionDialogEditReturnProps = SessionDialogEditReturnUpdate | SessionDialogEditReturnDelete


export default function SessionDialogEdit({ open, onClose, payload }: DialogProps<SessionDialogEditProps, null | SessionDialogEditReturnProps>) {
  const { editSession } = payload
  const [currentSession, setCurrentSession] = useState<Session | undefined>()
  const dialogs = useDialogs()
  const [sessionDataFormReady, setSessionDataFormReady] = useState<boolean>(false)

  useEffect(() => {
    if (!editSession) return

    editSession.getInfo().then(session => setCurrentSession(session))
  }, [editSession])

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!currentSession) return

    const formData = new FormData(event.currentTarget)
    const sessionFormDataJson = serializeSessionFormData(formData)

    onClose({
      type: 'update',
      data: {
        ...sessionFormDataJson,
        id: currentSession.id,
      },
    })
  }

  async function handleDeleteSessionClick() {
    if (!currentSession) return

    const result = await dialogs.open(SessionDialogDelete, {
      sessionName: currentSession.name,
    })

    if (result)
      await onClose({
        type: 'delete',
        data: currentSession.id,
      })
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      maxWidth="sm"
      fullWidth={true}
      PaperProps={{
        component: 'form',
        onSubmit: handleEditSubmit,
      }}
    >
      <DialogTitle>Edit Session</DialogTitle>
      <Divider />
      <DialogContent>
        {
          currentSession
            ? <>
                <SessionDataForm session={currentSession} onReady={state => setSessionDataFormReady(state)} />
                <Divider />
                <FormControl>
                  <Button color="error" onClick={handleDeleteSessionClick} sx={{width: '200px'}} endIcon={<DeleteIcon />}>
                    Delete Session
                  </Button>
                </FormControl>
              </>
            : <Box sx={{position: 'relative', height: '100px'}}>
                <BackdropContainer open={true} />
              </Box>
        }
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={() => onClose(null)}>Close</Button>
        <Button
          color="success"
          disabled={!sessionDataFormReady}
          type="submit"
        >Edit Session</Button>
      </DialogActions>
    </Dialog>
  )
}
