import SessionDialog, { SessionDialogProps } from './SessionDialog'
import { Divider, FormControl } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState } from 'react'
import { Session, SessionCreateData, SessionItem, SessionUpdateData } from '../../../types/session'
import Button from '@mui/material/Button'
import SessionDialogDelete from './SessionDialogDelete'


interface SessionDialogEditProps extends Omit<SessionDialogProps, 'open' | 'onSubmit'> {
  editSession?: SessionItem
  onSubmit: (sessionData: SessionUpdateData)=>void
  onDelete: (sessionId: string)=>Promise<void>
}


export default function SessionDialogEdit({ editSession, close, onSubmit, onDelete, ...props }: SessionDialogEditProps) {
  const [currentSession, setCurrentSession] = useState<Session | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false)

  useEffect(() => {
    if (!editSession) return

    editSession.getInfo().then(session => setCurrentSession(session))
  }, [editSession])

  function onClose() {
    setCurrentSession(undefined)
    close()
  }

  function handleSubmitData(sessionData: SessionCreateData) {
    if (!currentSession) return

    onSubmit({
      ...sessionData,
      id: currentSession.id,
    })
  }

  function handleDeleteSessionClick() {
    setDeleteConfirm(true)
  }

  async function handleOnDelete() {
    if (!currentSession) return

    setDeleteConfirm(false)
    onDelete(currentSession.id).then(() => onClose())
  }

  return (
    <SessionDialog
      { ...props }
      open={!!currentSession}
      close={onClose}
      session={currentSession}
      onSubmit={handleSubmitData}
    >
      <Divider />
      <FormControl>
        <Button color="error" onClick={handleDeleteSessionClick} sx={{width: '200px'}} endIcon={<DeleteIcon />}>
          Delete Session
        </Button>
        <SessionDialogDelete
          onClose={() => setDeleteConfirm(false)}
          open={deleteConfirm}
          sessionName={currentSession?.name || ''}
          onDelete={handleOnDelete}
        />
      </FormControl>
    </SessionDialog>
  )
}
