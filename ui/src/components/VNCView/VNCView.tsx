import React, { useEffect, useRef, useState } from 'react'
import { VncScreen } from 'react-vnc'
import { Box, Stack } from '@mui/material'
import VNCCredentialsDialog from './VNCCredentialsDialog'
import VNCSessionBar from '../vncSessionBar/VNCSessionBar'
import VNCSettingsDialog from './VNCSettingsDialog'
import { Toast } from '@docker/extension-api-client-types/dist/v1'
import VNCViewSkeleton from './VNCViewSkeleton'
import useVNCSettings from '../../hooks/useVNCSettings'
import { URL } from '../../libs/vnc/Proxy'


interface VNCViewProps {
  ddUIToast: Toast
  openBrowserURL: (url: string)=>void
  url?: URL
  onCancel: ()=>void
}

export interface VNCCredentials {
  username?: string
  password?: string
  saveCredentials: boolean
}

export interface VNCSettingsData {
  qualityLevel: number
  compressionLevel: number
  showDotCursor: boolean
}


export default function VNCView({ url, onCancel, ddUIToast, openBrowserURL }: VNCViewProps) {
  const vncContainerRef = useRef<HTMLDivElement>(null)
  const vncScreenRef = useRef<React.ElementRef<typeof VncScreen>>(null)
  const [credentials, setCredentials] = useState<VNCCredentials>({saveCredentials: false})
  const [needsCredentials, setNeedsCredentials] = useState<boolean>(false)
  const [trySaveCredentials, setTrySaveCredentials] = useState<boolean>(false)
  const [openSettingsDialog, setOpenSettingsDialog] = useState<boolean>(false)
  const [settings, saveSettings] = useVNCSettings()

  useEffect(() => {
    const { connect, connected, disconnect } = vncScreenRef.current ?? {};

    if (connected) {
      disconnect?.();
    }

    connect?.();
  }, [credentials])

  useEffect(() => {
    reconnect()
  }, [settings])

  function handleCredentialRequest() {
    if (trySaveCredentials) {
      setTrySaveCredentials(false)
      setNeedsCredentials(true)

      return
    }

    const savedCredentialsJSON = localStorage.getItem('credentials')

    if (!savedCredentialsJSON) {
      setTrySaveCredentials(false)
      setNeedsCredentials(true)

      return
    }

    setTrySaveCredentials(true)
    setCredentials(JSON.parse(savedCredentialsJSON))
  }

  function cancelCredentialDialog() {
    setNeedsCredentials(false)
    onCancel()
  }

  function handleCredentialDialogSubmit(credentials: VNCCredentials) {
    if (credentials.saveCredentials) {
      localStorage.setItem('credentials', JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }))
    }
    else {
      localStorage.removeItem('credentials')
    }

    setCredentials(credentials)
    setNeedsCredentials(false)
  }

  function handleSecurityFailure(e?: { detail: { status: number, reason: string } }) {
    const { connected, disconnect } = vncScreenRef.current ?? {};

    if (connected) {
      disconnect?.();
    }

    if (e?.detail.status === 0) return

    if (e)
      ddUIToast.error(e?.detail.reason)

    handleCredentialRequest()
  }

  function handleFullscreenClick() {
    vncContainerRef.current?.requestFullscreen()
  }

  function handleSettingsClick() {
    setOpenSettingsDialog(true)
  }

  function handleSettingsChange(settings: VNCSettingsData) {
    saveSettings(settings)
  }

  function handleOpenInBrowserClick() {
    if (!url?.browser) return

    openBrowserURL(url.browser)
  }

  function reconnect() {
    const { connect, connected, disconnect, sendKey, sendCtrlAltDel } = vncScreenRef.current ?? {}

    if (connected) {
      disconnect?.()
      connect?.()
    }
  }

  return (
    <>
      <Stack direction="column" spacing={1} sx={{height: '100%', overflow: 'hidden',}} >
        <VNCSessionBar
          vncScreenRef={vncScreenRef.current}
          onFullscreenClicked={handleFullscreenClick}
          onSettingsClicked={handleSettingsClick}
          onOpenInBrowserClicked={handleOpenInBrowserClick}
        />
        <Box ref={vncContainerRef} sx={{
          width: '100%',
          height: '100%',
          position: "relative",
          overflow: 'hidden',
        }}>
          <VncScreen
            url={url?.ws || ''}
            scaleViewport
            clipViewport
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
            ref={vncScreenRef}
            onCredentialsRequired={handleCredentialRequest}
            onSecurityFailure={handleSecurityFailure}
            rfbOptions={{
              credentials,
            }}
            loadingUI={<VNCViewSkeleton />}
            qualityLevel={settings.qualityLevel}
            compressionLevel={settings.compressionLevel}
            showDotCursor={settings.showDotCursor}
          />
        </Box>
      </Stack>

      <VNCSettingsDialog
        open={openSettingsDialog}
        close={() => setOpenSettingsDialog(false)}
        settingsData={settings}
        onSettingChange={handleSettingsChange}
      />

      <VNCCredentialsDialog
        open={needsCredentials}
        onClose={cancelCredentialDialog}
        onSubmit={handleCredentialDialogSubmit}
      />
    </>
  )
}
