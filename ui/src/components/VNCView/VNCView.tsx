import React, { useEffect, useRef, useState } from 'react'
import { VncScreen } from 'react-vnc'
import { Box, Stack } from '@mui/material'
import VNCCredentialsDialog from './VNCCredentialsDialog'
import VNCSessionBar from '../vncSessionBar/VNCSessionBar'


interface VNCViewProps {
  url: string
  onCancel: ()=>void
}

export interface VNCCredentials {
  username?: string
  password?: string
}


export default function VNCView({ url, onCancel }: VNCViewProps) {
  const vncContainerRef = useRef<HTMLDivElement>(null)
  const vncScreenRef = useRef<React.ElementRef<typeof VncScreen>>(null)
  const [credentials, setCredentials] = useState<VNCCredentials>({})
  const [needsCredentials, setNeedsCredentials] = useState<boolean>(false)

  useEffect(() => {
    const { connect, connected, disconnect } = vncScreenRef.current ?? {};

    if (connected) {
      disconnect?.();
    }

    connect?.();
  }, [credentials])

  function handleCredentialRequest() {
    setNeedsCredentials(true)
  }

  function cancelCredentialDialog() {
    setNeedsCredentials(false)
    onCancel()
  }

  function handleCredentialDialogSubmit(credentials: VNCCredentials) {
    console.log('credentials', credentials)
    setCredentials(credentials)
    setNeedsCredentials(false)
  }

  function handleSecurityFailure(e?: { detail: { status: number, reason: string } }) {
    const { connected, disconnect } = vncScreenRef.current ?? {};

    if (connected) {
      disconnect?.();
    }

    if (e?.detail.status === 0) return

    handleCredentialRequest()
  }

  function handleFullscreenClick() {
    vncContainerRef.current?.requestFullscreen()
  }

  // TODO
  function handleSettingsClick() {
    console.log('TODO')
  }

  return (
    <Stack direction="column" spacing={1} sx={{height: '100%'}} >
      <VNCSessionBar
        onFullscreenClicked={handleFullscreenClick}
        onSettingsClicked={handleSettingsClick}
      />
      <Box ref={vncContainerRef} sx={{
        display: 'flex',
        height: '100%',
      }}>
        <VncScreen
          url={url}
          scaleViewport
          clipViewport
          style={{
            width: '100%',
            height: '100%',
          }}
          debug
          ref={vncScreenRef}
          onCredentialsRequired={handleCredentialRequest}
          onSecurityFailure={handleSecurityFailure}  // TODO: IT SEEMS BUGGY...
          rfbOptions={{
            credentials,
            // TODO: NEEDS TO BE REMOVED
            // credentials: {
            //   password: 'password',
            // },
          }}
        />

        <VNCCredentialsDialog
          open={needsCredentials}
          onClose={cancelCredentialDialog}
          onSubmit={handleCredentialDialogSubmit}
        />
      </Box>
    </Stack>
  )
}
