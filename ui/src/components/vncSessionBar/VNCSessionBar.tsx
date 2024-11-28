import { Box, IconButton, Stack, Tooltip } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser'
import SendKeysMenu from './SendKeysMenu'
import { VncScreenHandle } from 'react-vnc'
import ClipboardMenu from './ClipboardMenu'


export interface VNCSessionBarProps {
  vncScreenRef:  VncScreenHandle | null
  onFullscreenClicked: ()=>void
  onSettingsClicked: ()=>void
  onOpenInBrowserClicked: ()=>void
  clipboardText: string
  sendClipboardText?: (text: string)=>void
}


export default function VNCSessionBar({
  vncScreenRef,
  onFullscreenClicked,
  onSettingsClicked,
  onOpenInBrowserClicked,
  clipboardText,
  sendClipboardText,
}: VNCSessionBarProps) {
  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Fullscreen" arrow>
        <IconButton onClick={onFullscreenClicked}>
          <FullscreenIcon />
        </IconButton>
      </Tooltip>
      <SendKeysMenu
        sendKey={vncScreenRef?.sendKey}
        sendCtrlAltDel={vncScreenRef?.sendCtrlAltDel}
      />
      <ClipboardMenu clipboardText={clipboardText} sendClipboardText={sendClipboardText} />

      <Box sx={{flexGrow: 1}} />

      <Tooltip title="Open in Browser" arrow>
        <IconButton onClick={onOpenInBrowserClicked}>
          <OpenInBrowserIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="VNC Settings" arrow>
        <IconButton onClick={onSettingsClicked}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
