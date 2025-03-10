import React, { useEffect, useState, useSyncExternalStore } from 'react'
import { Backdrop, Box, CircularProgress, IconButton, Stack, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import SessionDialog from '../session/sessionDialog/SessionDialog'
import SessionSelect from '../session/SessionSelect'
import SessionDialogEdit from '../session/sessionDialog/SessionDialogEdit'
import { Session, SessionCreateData, SessionUpdateData } from '../../types/session'
import { SessionStore } from '../../stores/sessionStore'
import { Toast } from '@docker/extension-api-client-types/dist/v1'
import ConnectButton from './ConnectButton'
import { useDialogs } from '@toolpad/core'


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
  const dialogs = useDialogs()
  const [currentDialog, setCurrentDialog] = useState<null | Promise<any>>(null)

  useEffect(() => {
    sessionStore.refresh().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!sessions.find(session => session.name === selectedSessionName))
      setSelectedSessionName('')
  }, [sessions])

  useEffect(() => {
    if (connectedSession) {
      setSelectedSessionName(connectedSession)

      if (currentDialog)
        dialogs.close(currentDialog, null).finally(() => setCurrentDialog(null))
    }
  }, [connectedSession])

  async function handleAddNewSessionClick() {
    const sessionDialogPromise = dialogs.open(SessionDialog, {
      title: 'Add new Session',
      submitButtonText: 'Create Session',
    })

    setCurrentDialog(sessionDialogPromise)
    const newSessionData = await sessionDialogPromise
    setCurrentDialog(null)

    if (!newSessionData)
      return

    await sendCreateSessionData(newSessionData)
  }

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

    const sessionEditDialogPromise = dialogs.open(SessionDialogEdit, {
      title: 'Edit Session',
      submitButtonText: 'Edit Session',
      editSession: selectedSession,
      getSessions: () => sessions,
    })

    setCurrentDialog(sessionEditDialogPromise)
    const result = await sessionEditDialogPromise
    setCurrentDialog(null)

    if (!result)
      return

    switch (result.type) {
      case 'update':
        await sendUpdateSessionData(result.data)
        break

      case 'create':
        await sendCreateSessionData(result.data)
        break

      case 'delete':
        await sendDeleteSession(result.data)
        break
    }
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
      <Stack direction="row" spacing={ 2 } alignItems="center">
        <Tooltip title="Create a new Session">
          <IconButton
            disabled={!!connectedSession}
            color="success"
            onClick={handleAddNewSessionClick}
          >
            <AddIcon/>
          </IconButton>
        </Tooltip>
        <SessionSelect
          disabled={!!connectedSession}
          sessions={sessions}
          selectedSessionName={selectedSessionName}
          setSelectedSessionName={setSelectedSessionName}
        />
        <Tooltip title="Edit selected Session">
          <IconButton disabled={selectedSessionName === '' || !!connectedSession} onClick={handleEditSessionClick}>
            <EditIcon/>
          </IconButton>
        </Tooltip>
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

      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  )
}
