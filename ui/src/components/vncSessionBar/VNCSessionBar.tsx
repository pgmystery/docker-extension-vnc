import { Box, IconButton, Stack, Tooltip } from '@mui/material'
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
  canvas,
}: VNCSessionBarProps) {
  const vnc = useContext(VNCContext)

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

      <Box sx={ {flexGrow: 1} }/>

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
