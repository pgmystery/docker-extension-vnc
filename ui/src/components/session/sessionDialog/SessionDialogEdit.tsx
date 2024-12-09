import SessionDialog, { SessionDialogProps } from './SessionDialog'
import { Divider, FormControl } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState } from 'react'
import Backend from '../../../api/Backend'
import { Session } from '../../../types/session'
import Button from '@mui/material/Button'
import { SessionCreateData, SessionUpdateData } from '../../../api/routes/session'


interface SessionDialogEditProps extends Omit<SessionDialogProps, 'open' | 'onSubmit'> {
  sessionId?: string
  backend?: Backend
  onSubmit: (sessionData: SessionUpdateData)=>void
}


export default function SessionDialogEdit({ sessionId, backend, close, onSubmit, ...props }: SessionDialogEditProps) {
  const [currentSession, setCurrentSession] = useState<Session | undefined>()
  console.log('currentSession', currentSession)

  useEffect(() => {
    if (!backend || !sessionId) return

    backend.session.getFromId(sessionId)
      .then(session => setCurrentSession(session))
  }, [sessionId])

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
      </FormControl>
    </SessionDialog>
  )
}
