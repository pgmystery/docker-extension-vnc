import { IconButton, Stack } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import FullscreenIcon from '@mui/icons-material/Fullscreen'


export interface VNCSessionBarProps {
  onFullscreenClicked: ()=>void
  onSettingsClicked: ()=>void
}


export default function VNCSessionBar({ onFullscreenClicked, onSettingsClicked }: VNCSessionBarProps) {
  return (
    <Stack direction="row" spacing={1}>
      <IconButton onClick={onSettingsClicked}>
        <SettingsIcon />
      </IconButton>
      <IconButton onClick={onFullscreenClicked}>
        <FullscreenIcon />
      </IconButton>
    </Stack>
  )
}
