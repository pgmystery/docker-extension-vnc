import { useEffect, useMemo, useState } from 'react'
import { Box, IconButton, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import SessionDialog from '../session/sessionDialog/SessionDialog'
import { SessionCreateData, SessionList } from '../../api/routes/session'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import Backend from '../../api/Backend'
import SessionSelect from '../session/SessionSelect'


export default function ConnectBar() {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const backend = useMemo(() => ddClient.extension.vm?.service && new Backend(ddClient.extension.vm), [ddClient])
  const [sessions, setSessions] = useState<SessionList>([])
  const [selectedSessionName, setSelectedSessionName] = useState<string>('')
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    if (!backend) return

    refreshSessions()
  }, [backend])

  async function refreshSessions() {
    if (!backend) return

    const sessions = await backend.session.getAll()
    setSessions(sessions)
  }

  async function sendCreateSessionData(sessionData: SessionCreateData) {
    if (!backend) return

    console.log('sessionData', sessionData)
    debugger

    const session = await backend.session.create(sessionData)

    debugger

    await refreshSessions()
    setSelectedSessionName(session.name)
  }

  return (
    <>
      <Stack direction="row" spacing={ 2 }>
        <IconButton color="success" onClick={() => setNewSessionDialogOpen(true)}>
          <AddIcon/>
        </IconButton>
        <SessionSelect
          sessions={sessions}
          selectedSessionName={selectedSessionName}
          setSelectedSessionName={setSelectedSessionName}
        />
        <IconButton disabled={selectedSessionName === ''}>
          <EditIcon/>
        </IconButton>
        {/*<IconButton color="error">*/ }
        {/*  <DeleteIcon />*/ }
        {/*</IconButton>*/ }
        <Box sx={ {flexGrow: 1} }/>
        <Button
          color="success"
          sx={ {
            minWidth: '180px',
          } }
          disabled={selectedSessionName === ''}
        >Connect</Button>
      </Stack>

      <SessionDialog
        title="Add new Session"
        submitButtonText="Create Session"
        open={ newSessionDialogOpen }
        close={ () => setNewSessionDialogOpen(false) }
        onSubmit={sendCreateSessionData}
      />
    </>
  )
}
