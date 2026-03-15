import { Box, Chip, CircularProgress, IconButton, Stack, Tooltip } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser'
import SendKeysMenu from './SendKeysMenu'
import { VncScreenHandle } from 'react-vnc'
import ClipboardMenu from './ClipboardMenu'
import SendMachineCommandsMenu, { MachineCommand } from './SendMachineCommandsMenu'
import DragViewportButton from './DragViewportButton'
import { RefObject, useContext, useEffect } from 'react'
import PowerIcon from '@mui/icons-material/Power'
import ScreenshotButton from './ScreenshotButton'
import RecordButton from './RecordButton'
import DockerCreateImageButton from './DockerCreateImageButton'
import { VNCContext } from '../../contexts/VNCContext'
import AudioVolumeMenu from './AudioVolumeMenu'
import CheckIcon from '@mui/icons-material/Check';
import { WebRTCAudioType } from '../../hooks/useWebRTCAudio'
import CloseIcon from '@mui/icons-material/Close'
import AudioMicrophoneMenu, { AudioMicrophoneMenuData } from './AudioMicrophoneMenu'
import AudioInstallIcon from '../../resources/icons/audio_install.svg?react'
import { PartialBy } from '../../types/utils'
import InstallAudioDialog from '../dialogs/InstallAudioDialog'
import { useDialogs } from '@toolpad/core'
import TargetDockerContainer from '../../libs/vnc/targets/TargetDockerContainer'

type AudioState = 'loading' | 'ready' | 'closed'

export interface VNCSessionBarProps {
  vncScreenRef: RefObject<VncScreenHandle> | null
  clippedViewport: boolean
  clipToWindowActive: boolean
  onDragWindowChange: (state: boolean) => void
  onFullscreenClicked: () => void
  onSettingsClicked: () => void
  onOpenInBrowserClicked: () => void
  onWebsocketUrlCopyClick: () => void
  clipboardText: string,
  sendClipboardText?: (text: string) => void
  sendMachineCommand: (command: MachineCommand) => void
  havePowerCapability: boolean
  viewOnly: boolean
  webRTCAudio?: WebRTCAudioType
  micAudio: PartialBy<AudioMicrophoneMenuData, 'mic'>
  canvas?: HTMLCanvasElement
}

export default function VNCSessionBar({
  vncScreenRef,
  clippedViewport,
  clipToWindowActive,
  onDragWindowChange,
  onFullscreenClicked,
  onSettingsClicked,
  onOpenInBrowserClicked,
  onWebsocketUrlCopyClick,
  clipboardText,
  sendClipboardText,
  sendMachineCommand,
  havePowerCapability,
  viewOnly,
  webRTCAudio,
  micAudio,
  canvas,
}: VNCSessionBarProps) {
  const vnc = useContext(VNCContext)
  const dialogs = useDialogs()

  const audioOutputStatus: AudioState | undefined = webRTCAudio
    ? (webRTCAudio.status === 'closed' ||
       webRTCAudio.status === 'failed' ||
       webRTCAudio.status === 'disconnected')
      ? 'closed'
      : (webRTCAudio.isReady ? 'ready' : 'loading')
    : undefined

  useEffect(() => {
    if (!vncScreenRef || !vncScreenRef.current?.rfb)
      return

    vncScreenRef.current.rfb.dragViewport = false
  }, [clipToWindowActive])

  return (
    <Stack direction="row" spacing={ 1 }>
      <Tooltip title="Fullscreen" arrow>
        <IconButton onClick={ onFullscreenClicked }>
          <FullscreenIcon/>
        </IconButton>
      </Tooltip>

      {
        clipToWindowActive && <DragViewportButton onChange={ (state) => {
          onDragWindowChange(state)
          if (!vncScreenRef || !vncScreenRef.current?.rfb)
            return

          vncScreenRef.current.rfb.dragViewport = state
        } } disabled={ !clippedViewport }/>
      }

      {
        !viewOnly && <>
          <SendKeysMenu
            disabled={!canvas}
            sendKey={ (keysym: number, code: string, down?: boolean) => vncScreenRef?.current?.sendKey(keysym, code, down) }
            sendCtrlAltDel={ () => {
              vncScreenRef?.current?.sendCtrlAltDel()
              vncScreenRef?.current?.focus()
            } }
          />
          <ClipboardMenu disabled={!canvas} clipboardText={ clipboardText } sendClipboardText={ sendClipboardText }/>
          { havePowerCapability && <SendMachineCommandsMenu sendMachineCommand={ sendMachineCommand }/> }
        </>
      }
      <ScreenshotButton canvas={canvas} />
      <RecordButton canvas={canvas} />
      { micAudio.mic &&
        <AudioMicrophoneMenu
          data={micAudio as AudioMicrophoneMenuData}
          disabled={!canvas}
        />
      }
      { audioOutputStatus === 'loading' &&
        <Chip
          size="medium"
          icon={
            audioOutputStatus === 'loading'
            ? <CircularProgress color="inherit" size={16} sx={{marginRight: '5px'}} />
            : audioOutputStatus === 'closed'
              ? <CloseIcon />
              : <CheckIcon />
          }
          color={audioOutputStatus === 'loading' ? 'warning' : audioOutputStatus === 'closed' ? 'error' : 'success'}
          label={audioOutputStatus === 'loading' ? 'Connecting Audio...' : audioOutputStatus === 'closed' ? 'Audio closed' : 'Audio'}
          sx={{
            paddingLeft: '10px',
            paddingRight: '10px',
            height: '32px',
          }}
        />
      }
      { webRTCAudio && audioOutputStatus !== 'loading' &&
        <AudioVolumeMenu
          volumeRef={webRTCAudio.volumeRef}
          setVolume={webRTCAudio.setVolume}
          mutedRef={webRTCAudio.mutedRef}
          setIsMuted={webRTCAudio.setMuted}
          disabled={!canvas || !webRTCAudio.isReady}
        />
      }

      <Box sx={ {flexGrow: 1} }/>

      { (!micAudio.mic || !webRTCAudio) && vnc?.connectedData?.connection.target instanceof TargetDockerContainer &&
        <Tooltip title="Install Audio support">
          <IconButton
            disabled={!canvas}
            onClick={async () => {
              if (!vnc)
                return

              if (!(vnc?.connectedData?.connection.target instanceof TargetDockerContainer))
                return

              const containerId = vnc.connectedData.connection.target.getContainerId()
              if (!containerId)
                return

              await dialogs.open(InstallAudioDialog, {
                containerId,
                vncHandler: vnc,
                installedAudios: {
                  input: !!micAudio.mic,
                  output: !!webRTCAudio,
                }
              })
            }}
          >
            <AudioInstallIcon />
          </IconButton>
        </Tooltip>
      }

      { vnc?.connectedData?.connection.type !== 'remote' && <DockerCreateImageButton disabled={ !canvas }/> }
      <Tooltip title="Copy Websocket-URL to Clipboard" arrow>
        <IconButton onClick={ onWebsocketUrlCopyClick }>
          <PowerIcon/>
        </IconButton>
      </Tooltip>
      <Tooltip title="Open in Browser" arrow>
        <IconButton onClick={ onOpenInBrowserClicked }>
          <OpenInBrowserIcon/>
        </IconButton>
      </Tooltip>
      <Tooltip title="VNC Settings" arrow>
        <IconButton onClick={ onSettingsClicked }>
          <SettingsIcon/>
        </IconButton>
      </Tooltip>

    </Stack>
  )
}
