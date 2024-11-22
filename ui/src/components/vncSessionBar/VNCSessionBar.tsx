import { IconButton, Stack } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';


export interface VNCSessionBarProps {
  onFullscreenClicked: ()=>void
  onSettingsClicked: ()=>void
  onOpenInBrowserClicked: ()=>void
}


export default function VNCSessionBar({
  onFullscreenClicked,
  onSettingsClicked,
  onOpenInBrowserClicked,
}: VNCSessionBarProps) {
  return (
    <Stack direction="row" spacing={1}>
      <IconButton title="VNC Settings" onClick={onSettingsClicked}>
        <SettingsIcon />
      </IconButton>
      <IconButton title="Fullscreen" onClick={onFullscreenClicked}>
        <FullscreenIcon />
      </IconButton>
      <IconButton title="Open in Browser" onClick={onOpenInBrowserClicked}>
        <OpenInBrowserIcon />
      </IconButton>
    </Stack>
  )
}
