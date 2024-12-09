import React, { useEffect, useMemo, useState } from 'react'
import { Backdrop, Box, CircularProgress, IconButton, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import SessionDialog from '../session/sessionDialog/SessionDialog'
import { SessionCreateData, SessionList, SessionUpdateData } from '../../api/routes/session'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import Backend from '../../api/Backend'
import SessionSelect from '../session/SessionSelect'
import SessionDialogEdit from '../session/sessionDialog/SessionDialogEdit'


export default function ConnectBar() {
  const [loading, setLoading] = useState<boolean>(true)
  const ddClient = useMemo(createDockerDesktopClient, [])
  const backend = useMemo(() => ddClient.extension.vm?.service && new Backend(ddClient.extension.vm), [ddClient])
  const [sessions, setSessions] = useState<SessionList>([])
  const [selectedSessionName, setSelectedSessionName] = useState<string>('')
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState<boolean>(false)
  const [editSessionId, setEditSessionId] = useState<string | undefined>()

  useEffect(() => {
    if (!backend) return

    refreshSessions().finally(() => setLoading(false))
  }, [backend])

  async function refreshSessions() {
    if (!backend) return

    const sessions = await backend.session.getAll()
    setSessions(sessions)
  }

  async function sendCreateSessionData(sessionData: SessionCreateData) {
    if (!backend) return

    console.log('CREATE SESSION DATA', sessionData)
    const session = await backend.session.create(sessionData)

    await refreshSessions()
    setSelectedSessionName(session.name)
  }

  async function sendUpdateSessionData(sessionData: SessionUpdateData) {
    if (!backend) return

    console.log('UPDATE SESSION DATA', sessionData)
    const session = await backend.session.update(sessionData)

    await refreshSessions()
    setSelectedSessionName(session.name)
  }

  function getSelectedSession() {
    return sessions.find(session => session.name === selectedSessionName)
  }

  async function handleEditSessionClick() {
    const selectedSession = getSelectedSession()
    if (!backend || !selectedSession) return

    setEditSessionId(selectedSession.id)
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
        <IconButton disabled={selectedSessionName === ''} onClick={handleEditSessionClick}>
          <EditIcon/>
        </IconButton>
        <Box sx={ {flexGrow: 1} }/>
        <Button
          color="success"
          sx={ {
            minWidth: '180px',
          } }
          disabled={selectedSessionName === '' || loading}
        >Connect</Button>
      </Stack>

      <SessionDialog
        title="Add new Session"
        submitButtonText="Create Session"
        open={ newSessionDialogOpen }
        close={ () => setNewSessionDialogOpen(false) }
        onSubmit={sendCreateSessionData}
      />

      <SessionDialogEdit
        title="Edit Session"
        submitButtonText="Edit Session"
        sessionId={editSessionId}
        close={() => setEditSessionId(undefined)}
        onSubmit={sendUpdateSessionData}
        backend={backend}
      />

      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}
