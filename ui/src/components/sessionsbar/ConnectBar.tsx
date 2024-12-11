import React, { useEffect, useState, useSyncExternalStore } from 'react'
import { Backdrop, Box, CircularProgress, IconButton, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import SessionDialog from '../session/sessionDialog/SessionDialog'
import SessionSelect from '../session/SessionSelect'
import SessionDialogEdit from '../session/sessionDialog/SessionDialogEdit'
import { Session, SessionCreateData, SessionItem, SessionUpdateData } from '../../types/session'
import { SessionStore } from '../../stores/sessionStore'
import { Toast } from '@docker/extension-api-client-types/dist/v1'
import ConnectButton from '../connectbar/ConnectButton'


interface ConnectBarProps {
  sessionStore: SessionStore
  onConnect: (session: Session)=>void
  onDisconnect: ()=>void
  connected: boolean
  ddUIToast: Toast
}


export default function ConnectBar({ connected, sessionStore, ddUIToast, onConnect, onDisconnect }: ConnectBarProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const sessions = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
  const [selectedSessionName, setSelectedSessionName] = useState<string>('')
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState<boolean>(false)
  const [editSession, setEditSession] = useState<SessionItem | undefined>()

  useEffect(() => {
    sessionStore.refresh().finally(() => setLoading(false))
  }, [])

  async function sendCreateSessionData(sessionData: SessionCreateData) {
    try {
      await sessionStore.add(sessionData)
    }
    catch (e: any) {
      console.error(e)

      if (e instanceof Object && e.hasOwnProperty('message'))
        ddUIToast.error(e.message)

      return
    }

    setSelectedSessionName(sessionData.name)
  }

  async function sendUpdateSessionData(sessionData: SessionUpdateData) {
    try {
      await sessionStore.update(sessionData)
    }
    catch (e: any) {
      console.error(e)

      if (e instanceof Object && e.hasOwnProperty('message'))
        ddUIToast.error(e.message)

      return
    }

    setSelectedSessionName(sessionData.name)
  }

  async function sendDeleteSession(sessionId: string) {
    try {
      await sessionStore.delete(sessionId)
    }
    catch (e: any) {
      console.error(e)

      if (e instanceof Object && e.hasOwnProperty('message'))
        ddUIToast.error(e.message)

      return
    }

    setSelectedSessionName('')
  }

  function getSelectedSession() {
    return sessions.find(session => session.name === selectedSessionName)
  }

  async function handleEditSessionClick() {
    const selectedSession = getSelectedSession()
    if (!selectedSession) return

    setEditSession(selectedSession)
  }

  async function handleConnectClick() {
    if (!selectedSessionName) return

    const sessionItem = sessions.find(session => session.name === selectedSessionName)

    if (!sessionItem) return

    const session = await sessionItem.getInfo()
    onConnect(session)
  }

  return (
    <>
      <Stack direction="row" spacing={ 2 }>
        <IconButton disabled={connected} color="success" onClick={() => setNewSessionDialogOpen(true)}>
          <AddIcon/>
        </IconButton>
        <SessionSelect
          disabled={connected}
          sessions={sessions}
          selectedSessionName={selectedSessionName}
          setSelectedSessionName={setSelectedSessionName}
        />
        <IconButton disabled={selectedSessionName === '' || connected} onClick={handleEditSessionClick}>
          <EditIcon/>
        </IconButton>
        <Box sx={ {flexGrow: 1} }/>
        <ConnectButton
          onConnect={handleConnectClick}
          onDisconnect={onDisconnect}
          connected={connected}
          connectButtonDisabled={selectedSessionName === '' || loading || connected}
          disconnectButtonDisabled={!connected}
          sx={{
            minWidth: '180px',
          }}
        />
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
        editSession={editSession}
        close={() => setEditSession(undefined)}
        onSubmit={sendUpdateSessionData}
        onDelete={sendDeleteSession}
      />

      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}
