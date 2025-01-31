import { SessionDialogProps } from './SessionDialog'
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  IconButton
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState } from 'react'
import { Session, SessionCreateData, SessionItem, SessionList, SessionUpdateData } from '../../../types/session'
import Button from '@mui/material/Button'
import SessionDialogDelete from './SessionDialogDelete'
import { DialogProps, useDialogs } from '@toolpad/core'
import SessionDataForm, { serializeSessionFormData } from '../forms/SessionDataForm'
import BackdropContainer from '../../utils/BackdropContainer'
import CloseIcon from '@mui/icons-material/Close'
import SelectButton from '../../utils/SelectButton/SelectButton'
import SelectButtonItem from '../../utils/SelectButton/SelectButtonItem'
import useFormSubmit, { UseFormSubmitEvent } from '../../../hooks/useFormSubmit'
import useBackdrop from '../../../hooks/useBackdrops/useBackdrop'


interface SessionDialogEditProps extends Omit<SessionDialogProps, 'open' | 'onSubmit'> {
  editSession: SessionItem
  getSessions: ()=>SessionList
}

interface SessionDialogEditReturnUpdate {
  type: 'update'
  data: SessionUpdateData
}

interface SessionDialogEditReturnCreate {
  type: 'create'
  data: SessionCreateData
}

interface SessionDialogEditReturnDelete {
  type: 'delete'
  data: string
}

type SessionDialogEditReturnProps =
  SessionDialogEditReturnUpdate
  | SessionDialogEditReturnCreate
  | SessionDialogEditReturnDelete


export default function SessionDialogEdit({ open, onClose, payload }: DialogProps<SessionDialogEditProps, null | SessionDialogEditReturnProps>) {
  const { editSession, getSessions } = payload
  const [dialogFormRef, dialogFormSubmit] = useFormSubmit()
  const { showBackdrop, isBackdropShowing } = useBackdrop({
    sx: { zIndex: 9999 },
  })
  const [currentSession, setCurrentSession] = useState<Session | undefined>()
  const dialogs = useDialogs()
  const [sessionDataFormReady, setSessionDataFormReady] = useState<boolean>(false)
  const [deleteDialogPromise, setDeleteDialogPromise] = useState<null | Promise<boolean>>(null)

  useEffect(() => {
    if (!open && deleteDialogPromise)
        dialogs.close(deleteDialogPromise, false).finally(() => setDeleteDialogPromise(null))
  }, [open])

  useEffect(() => {
    if (!editSession) return

    editSession.getInfo().then(session => setCurrentSession(session))
  }, [editSession])

  function handleEditSession(sessionData: SessionCreateData) {
    if (!currentSession) return

    return onClose({
      type: 'update',
      data: {
        ...sessionData,
        id: currentSession.id,
      },
    })
  }

  function handleCreateSession(sessionData: SessionCreateData) {
    function setUniqueSessionName(sessionData: SessionCreateData, sessions: SessionList) {
      if (!sessions.some(session => session.name === sessionData.name))
        return

      sessionData.name += ' (copy)'

      return setUniqueSessionName(sessionData, sessions)
    }

    setUniqueSessionName(sessionData, getSessions())

    return onClose({
      type: 'create',
      data: sessionData,
    })
  }

  function getFormData(event: UseFormSubmitEvent) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    return {
      data: serializeSessionFormData(formData),
      submitter: event.nativeEvent.detail,
    }
  }

  function handleSubmit(event: UseFormSubmitEvent) {
    return showBackdrop(async () => {
      const formData = getFormData(event)

      switch (formData.submitter) {
        case 'edit':
          return handleEditSession(formData.data)

        case 'create':
          return handleCreateSession(formData.data)
      }
    })
  }

  async function handleDeleteSessionClick() {
    if (!currentSession) return

    const sessionDeleteDialogPromise = dialogs.open(SessionDialogDelete, {
      sessionName: currentSession.name,
    })

    setDeleteDialogPromise(sessionDeleteDialogPromise)
    const result = await sessionDeleteDialogPromise
    setDeleteDialogPromise(null)

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
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
          ref: dialogFormRef,
        }
      }}
    >
      <DialogTitle>Edit Session</DialogTitle>
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
        {
          currentSession
            ? <>
                <SessionDataForm
                  session={currentSession}
                  onReady={state => setSessionDataFormReady(state)}
                />
                <Divider />
                <FormControl>
                  <FormLabel sx={{marginBottom: '10px'}}>Delete Session</FormLabel>
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
        <SelectButton
          color="success"
          disabled={!sessionDataFormReady || isBackdropShowing}
        >
          <SelectButtonItem
            onTrigger={() => dialogFormSubmit('edit')}
          >Edit Session</SelectButtonItem>
          <SelectButtonItem
            onTrigger={() => dialogFormSubmit('create')}
          >Clone Session</SelectButtonItem>
        </SelectButton>
      </DialogActions>
    </Dialog>
  )
}
