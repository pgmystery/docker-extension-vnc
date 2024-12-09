import SessionDialog, { SessionDialogProps } from './SessionDialog'
import { Divider, FormControl } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState } from 'react'
import Backend from '../../../api/Backend'
import { Session } from '../../../types/session'
import Button from '@mui/material/Button'


interface SessionDialogEditProps extends Omit<SessionDialogProps, 'open'> {
  sessionId?: string
  backend?: Backend
}


export default function SessionDialogEdit({ sessionId, backend, close, ...props }: SessionDialogEditProps) {
  const [currentSession, setCurrentSession] = useState<Session | undefined>()

  useEffect(() => {
    console.log('sessionId', sessionId, backend)
    if (!backend || !sessionId) return

    backend.session.getFromId(sessionId)
      .then(session => {
        console.log('session', session)
        setCurrentSession(session)
      })
  }, [sessionId])

  function onClose() {
    setCurrentSession(undefined)
    close()
  }

  function handleDeleteSessionClick() {

  }

  return (
    <SessionDialog { ...props } open={!!currentSession} close={onClose} session={currentSession} >
      <Divider />
      <FormControl>
        <Button color="error" onClick={handleDeleteSessionClick} sx={{width: '200px'}} endIcon={<DeleteIcon />}>
          Delete Session
        </Button>
      </FormControl>
    </SessionDialog>
  )
}
