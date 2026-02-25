import { MouseEvent, useEffect, useState } from 'react'
import { IconButton, ListSubheader, Menu, Slider, Stack, Tooltip } from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'

interface AudioVolumeMenuProps {
  volumeRef: React.MutableRefObject<number>
  setVolume: (volume: number) => void
  mutedRef: React.MutableRefObject<boolean>
  setIsMuted: (isMuted: boolean) => void
  disabled?: boolean
}

export default function AudioVolumeMenu({ volumeRef, setVolume, mutedRef, setIsMuted, disabled }: AudioVolumeMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  // Local UI state so the menu updates immediately even if parent doesn't re-render
  const [uiVolume, setUiVolume] = useState<number>(volumeRef.current)
  const [uiMuted, setUiMuted] = useState<boolean>(mutedRef.current)

  useEffect(() => {
    setUiMuted(mutedRef.current)
  }, [mutedRef.current])

  function handleClick(event: MouseEvent<HTMLElement>) {
    // Pull the *latest* values from refs at open time
    setUiVolume(volumeRef.current)
    setUiMuted(mutedRef.current)
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Audio Volume" arrow>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'key-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          disabled={disabled}
        >
          {uiMuted ? <VolumeOffIcon color="error" /> : <VolumeUpIcon />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="key-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <ListSubheader>Audio Volume</ListSubheader>

        <Stack sx={{ height: 200 }} spacing={1} direction="column" alignItems="center" justifyContent="center">
          <Tooltip title={uiMuted ? 'Unmute' : 'Mute'}>
            <IconButton
              size="large"
              onClick={() => {
                const next = !uiMuted
                setUiMuted(next)
                setIsMuted(next)
              }}
            >
              {uiMuted ? <VolumeOffIcon color="error" /> : <VolumeUpIcon />}
            </IconButton>
          </Tooltip>

          <Slider
            orientation="vertical"
            value={uiVolume}
            onChange={(_, newValue) => {
              const v = newValue as number
              setUiVolume(v)
              setVolume(v)
            }}
            min={0}
            max={100}
            valueLabelDisplay="on"
          />
        </Stack>
      </Menu>
    </>
  )
}
