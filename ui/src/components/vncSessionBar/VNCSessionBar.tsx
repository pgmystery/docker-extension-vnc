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
      <IconButton onClick={onSettingsClicked}>
        <SettingsIcon />
      </IconButton>
      <IconButton onClick={onFullscreenClicked}>
        <FullscreenIcon />
      </IconButton>
      <IconButton onClick={onOpenInBrowserClicked}>
        <OpenInBrowserIcon />
      </IconButton>
    </Stack>
  )
}
