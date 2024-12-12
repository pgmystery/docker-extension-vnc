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
  connectedSession?: string
  ddUIToast: Toast
  disabled?: boolean
}


export default function ConnectBar({ connectedSession, sessionStore, ddUIToast, onConnect, onDisconnect, disabled }: ConnectBarProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const sessions = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
  const [selectedSessionName, setSelectedSessionName] = useState<string>('')
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState<boolean>(false)
  const [editSession, setEditSession] = useState<SessionItem | undefined>()
  const [changeSession, setChangeSession] = useState<string | null>(null)

  useEffect(() => {
    sessionStore.refresh().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!sessions.find(session => session.name === selectedSessionName)) {
      setSelectedSessionName('')
      setChangeSession(null)
    }
  }, [sessions])

  useEffect(() => {
    if (connectedSession) {
      setSelectedSessionName(connectedSession)
      setChangeSession(connectedSession)
    }
  }, [connectedSession])

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
    setChangeSession(sessionData.name)
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
    setChangeSession(sessionData.name)
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
    setChangeSession(null)
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
        <IconButton disabled={!!connectedSession} color="success" onClick={() => setNewSessionDialogOpen(true)}>
          <AddIcon/>
        </IconButton>
        <SessionSelect
          disabled={!!connectedSession}
          sessions={sessions}
          selectedSessionName={selectedSessionName}
          setSelectedSessionName={setSelectedSessionName}
          changeSelection={changeSession}
        />
        <IconButton disabled={selectedSessionName === '' || !!connectedSession} onClick={handleEditSessionClick}>
          <EditIcon/>
        </IconButton>
        <Box sx={ {flexGrow: 1} }/>
        <ConnectButton
          onConnect={handleConnectClick}
          onDisconnect={onDisconnect}
          connected={!!connectedSession}
          connectButtonDisabled={selectedSessionName === '' || loading || !!connectedSession || disabled}
          disconnectButtonDisabled={loading || !connectedSession || disabled}
          sx={{
            minWidth: '180px',
          }}
        />
      </Stack>

      {
        editSession
          ? <SessionDialogEdit
              title="Edit Session"
              submitButtonText="Edit Session"
              editSession={editSession}
              close={() => setEditSession(undefined)}
              onSubmit={sendUpdateSessionData}
              onDelete={sendDeleteSession}
            />
          : <SessionDialog
              title="Add new Session"
              submitButtonText="Create Session"
              open={ newSessionDialogOpen }
              close={ () => setNewSessionDialogOpen(false) }
              onSubmit={sendCreateSessionData}
            />
      }

      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}
