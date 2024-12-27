import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { VncScreen } from 'react-vnc'
import { Box, Stack } from '@mui/material'
import VNCCredentialsDialog, { VNCCredentialsDialogData } from './VNCCredentialsDialog'
import VNCSessionBar from '../vncSessionBar/VNCSessionBar'
import VNCSettingsDialog from './VNCSettingsDialog'
import { Toast } from '@docker/extension-api-client-types/dist/v1'
import VNCViewSkeleton from './VNCViewSkeleton'
import { ProxyURL } from '../../libs/vnc/proxies/Proxy'
import { MachineCommand } from '../vncSessionBar/SendMachineCommandsMenu'
import { SessionCredentials } from '../../types/session'
import { SessionStore } from '../../stores/sessionStore'
import { VNCSettings, getVNCSettingsStore } from '../../stores/vncSettingsStore'
import useWindowFocus from '../../hooks/useWindowFocus'


interface VNCViewProps {
  sessionName: string
  ddUIToast: Toast
  openBrowserURL: (url: string)=>void
  url?: ProxyURL
  onCancel: ()=>void
  credentials?: VNCCredentials
  sessionStore: SessionStore
}

export type VNCCredentials = Partial<SessionCredentials>


export default function VNCView({ sessionName, url, onCancel, ddUIToast, openBrowserURL, credentials, sessionStore }: VNCViewProps) {
  useWindowFocus({
    onFocus: handleWindowFocus,
  })
  const [ready, setReady] = useState<boolean>(false)
  const vncContainerRef = useRef<HTMLDivElement>(null)
  const vncScreenRef = useRef<React.ElementRef<typeof VncScreen>>(null)
  const vncSettingsStore = useMemo(getVNCSettingsStore, [])
  const vncSettings = useSyncExternalStore(vncSettingsStore.subscribe, vncSettingsStore.getSnapshot)
  const [currentCredentials, setCurrentCredentials] = useState<VNCCredentials>({})
  const [needsCredentials, setNeedsCredentials] = useState<boolean>(false)
  const [trySaveCredentials, setTrySaveCredentials] = useState<boolean>(false)
  const [openSettingsDialog, setOpenSettingsDialog] = useState<boolean>(false)
  const [clipboardText, setClipboardText] = useState<string>('')
  const [havePowerCapability, setHavePowerCapability] = useState<boolean>(false)
  const [isClippedViewport, setIsClippedViewport] = useState<boolean>(false)

  useEffect(() => {
    if ('load' in vncSettingsStore)
      vncSettingsStore.load().finally(() => setReady(true))
  }, [])

  useEffect(() => {
    const { connect, connected, disconnect } = vncScreenRef.current ?? {}

    if (connected) {
      disconnect?.()
    }

    connect?.()
  }, [currentCredentials])

  useEffect(() => {
    reconnect()
  }, [vncSettings])

  useEffect(() => {
    if (credentials)
      handleCredentialDialogSubmit({
        ...credentials,
        save: false,
      })
  }, [credentials])

  useEffect(() => {
    const { getCapabilities } = vncScreenRef.current ?? {}

    if (!getCapabilities)
      return setHavePowerCapability(false)

    const capabilities = getCapabilities()

    setHavePowerCapability(capabilities?.power || false)
  }, [vncContainerRef.current])

  function onVNCConnect() {
    if (!vncContainerRef.current) return

    const bodyElement = document.getElementsByTagName('body').item(0)
    if (!bodyElement) return

    const bodyCanvasElements = bodyElement.getElementsByTagName('canvas')
    if (bodyCanvasElements.length === 0) return

    let bodyCanvasElement: HTMLCanvasElement | undefined
    for (const canvasElement of bodyCanvasElements) {
      if (canvasElement.parentElement === bodyElement) {
        bodyCanvasElement = canvasElement
        break
      }
    }

    if (!bodyCanvasElement) return

    const vncCanvasElement = vncContainerRef.current.getElementsByTagName('canvas').item(0)
    if (!vncCanvasElement) return

    vncCanvasElement.parentElement?.appendChild(bodyCanvasElement)
  }

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
    setCurrentCredentials(JSON.parse(savedCredentialsJSON))
  }

  function cancelCredentialDialog() {
    setNeedsCredentials(false)
    onCancel()
  }

  async function handleCredentialDialogSubmit(credentials: VNCCredentialsDialogData) {
    if (credentials.save) {
      const session = await sessionStore.getSessionByName(sessionName)
      if (!session) {
        const errorMessage = `Can't find session "${session}"`

        ddUIToast.error(errorMessage)

        throw new Error(errorMessage)
      }

      try {
        await sessionStore.update({
          ...session,
          credentials: {
            username: credentials.username || '',
            password: credentials.password || '',
          }
        })
      }
      catch (e: any) {
        console.error(e)

        if (e instanceof Object && e.hasOwnProperty('message'))
          ddUIToast.error(e.message)
      }
    }

    setCurrentCredentials(credentials)
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

  async function handleSettingsChange(settings: VNCSettings) {
    await vncSettingsStore.set(settings)
  }

  function handleOpenInBrowserClick() {
    if (!url?.browser) return

    openBrowserURL(url.browser)
  }

  function reconnect() {
    const { connect, connected, disconnect } = vncScreenRef.current ?? {}

    if (connected) {
      disconnect?.()
      connect?.()
    }
  }

  function sendClipboardText(text: string) {
    const { connected, clipboardPaste } = vncScreenRef.current ?? {}

    if (connected && clipboardPaste) {
      clipboardPaste(text)
    }
  }

  function sendMachineCommand(command: MachineCommand) {
    switch (command) {
      case 'reboot':
        const { machineReboot } = vncScreenRef.current ?? {}
        if (!machineReboot) return

        machineReboot()
        break

      case 'shutdown':
        const { machineShutdown } = vncScreenRef.current ?? {}
        if (!machineShutdown) return

        machineShutdown()
        break

      case 'reset':
        const { machineReset } = vncScreenRef.current ?? {}
        if (!machineReset) return

        machineReset()
        break
    }
  }

  function handleWindowFocus() {
    const { connected, focus } = vncScreenRef.current || {}

    if (connected && focus && document.activeElement?.tagName.toLowerCase() === 'body')
      focus()
  }

  function handleClippingViewport(e?: { detail: boolean }) {
    setIsClippedViewport(e?.detail || false)
  }

  return (
    <>
      <Stack direction="column" spacing={1} sx={{height: '100%', overflow: 'hidden'}} >
        <VNCSessionBar
          vncScreenRef={vncScreenRef}
          clippedViewport={isClippedViewport}
          clipToWindowActive={vncSettings.scaling.clipToWindow}
          onDragWindowChange={(state) => vncScreenRef.current?.rfb && (vncScreenRef.current.rfb.dragViewport = state)}
          onFullscreenClicked={handleFullscreenClick}
          onSettingsClicked={handleSettingsClick}
          onOpenInBrowserClicked={handleOpenInBrowserClick}
          clipboardText={clipboardText}
          sendClipboardText={sendClipboardText}
          sendMachineCommand={sendMachineCommand}
          havePowerCapability={havePowerCapability}
          viewOnly={vncSettings.viewOnly}
        />
        <Box ref={vncContainerRef} sx={{
          width: '100%',
          height: '100%',
          position: "relative",
          overflow: 'hidden',
        }}>
          {
            ready
              ? <VncScreen
                  url={url?.ws || ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                  }}
                  ref={vncScreenRef}
                  onConnect={onVNCConnect}
                  onCredentialsRequired={handleCredentialRequest}
                  onSecurityFailure={handleSecurityFailure}
                  rfbOptions={{
                    credentials: currentCredentials,
                  }}
                  loadingUI={<VNCViewSkeleton />}
                  qualityLevel={vncSettings.qualityLevel}
                  compressionLevel={vncSettings.compressionLevel}
                  showDotCursor={vncSettings.showDotCursor}
                  viewOnly={vncSettings.viewOnly}
                  scaleViewport={vncSettings.scaling.resize === 'scale'}
                  resizeSession={vncSettings.scaling.resize === 'remote'}
                  clipViewport={vncSettings.scaling.clipToWindow}
                  onClippingViewport={handleClippingViewport}
                  onClipboard={e => setClipboardText(e?.detail.text || '')}
                  onCapabilities={(e?: { detail: { capabilities: any } }) => {
                    setHavePowerCapability(false)

                    if (e?.detail.capabilities.hasOwnProperty('power')) {
                      setHavePowerCapability(e?.detail.capabilities.power || false)
                    }
                  }}
                />
              : <VNCViewSkeleton />
          }

        </Box>
      </Stack>

      <VNCSettingsDialog
        open={openSettingsDialog}
        close={() => setOpenSettingsDialog(false)}
        settingsData={vncSettings}
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
