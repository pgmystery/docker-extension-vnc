import { IconButton, Tooltip } from '@mui/material'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { RefObject } from 'react'

interface FullscreenButtonProps {
  element: RefObject<HTMLDivElement>
}

export default function FullscreenButton({ element }: FullscreenButtonProps) {
  function handleClick() {
    element.current?.requestFullscreen()
  }

  return (
    <Tooltip title="Fullscreen" arrow>
      <IconButton onClick={ handleClick } disabled={ !element.current }>
        <FullscreenIcon/>
      </IconButton>
    </Tooltip>
  )
}
