import { MicrophoneType } from '../../hooks/useMicrophone'
import { MouseEvent, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'
import MicNoneIcon from '@mui/icons-material/MicNone'
import MicOffIcon from '@mui/icons-material/MicOff'
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice'
import InputDevicesSelect from '../VNCView/VNCSettingForms/base/audio/InputDevicesSelect'
import MicExternalOffIcon from '@mui/icons-material/MicExternalOff'

export interface AudioMicrophoneMenuData {
  enabled: boolean
  muted: boolean
  device?: string
  mic: MicrophoneType
}

interface AudioMicrophoneMenuProps {
  data: AudioMicrophoneMenuData
  disabled?: boolean
}

export default function AudioMicrophoneMenu({ data, disabled }: AudioMicrophoneMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const { enabled, muted, mic, device } = data

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    if (enabled)
      return

    mic.stopMicrophone()
  }, [enabled, mic])

  useEffect(() => {
    mic.setMuted(muted)
  }, [muted])

  useEffect(() => {
    mic.getInputDevices().then(devices => setDevices(devices))
  }, [mic])

  useEffect(() => {
    mic.getInputDevices().then(devices => {
      if (device && devices.some(d => d.deviceId === device))
        mic.setInputDevice(device)
      else
        mic.setInputDevice(devices[0]?.deviceId ?? null)
    })
  }, [device])

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  const isConnected = mic.isReady || mic.isTalking
  const isBusy = useMemo(() => mic.status === 'starting' || mic.status === 'stopping', [mic.status])

  const connectButtonLabel = useMemo(() => {
    if (mic.status === 'starting') return 'Connecting…'
    if (mic.status === 'stopping') return 'Disconnecting…'
    return isConnected ? 'Disconnect microphone' : 'Connect microphone'
  }, [isConnected, mic.status])

  const statusChip = useMemo(() => {
    if (mic.status === 'starting') return { label: 'Connecting', color: 'info' as const, variant: 'filled' as const }
    if (mic.status === 'stopping') return { label: 'Disconnecting', color: 'info' as const, variant: 'filled' as const }
    if (!isConnected) return { label: 'Disconnected', color: 'default' as const, variant: 'outlined' as const }
    if (mic.isMuted) return { label: 'Muted', color: 'warning' as const, variant: 'filled' as const }
    if (mic.isTalking) return { label: 'Live', color: 'success' as const, variant: 'filled' as const }
    return { label: 'Ready', color: 'success' as const, variant: 'outlined' as const }
  }, [isConnected, mic.isMuted, mic.isTalking, mic.status])

  async function handleConnectToggle() {
    if (isBusy) return

    if (isConnected) {
      mic.stopMicrophone()
      return
    }

    await mic.startMicrophone()

    const permissionState = await mic.getMicPermissionState()
    console.log('Mic permission state:', permissionState)
  }

  return (
    <>
      <Tooltip title="Microphone" arrow>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'mic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          disabled={!enabled || disabled}
        >
          {
            mic.isMuted
              ? <MicOffIcon color={enabled ? 'error' : 'disabled'} />
              : mic.isReady
                ? <MicIcon color="success" />
                : mic.isTalking
                  ? <MicIcon color="success" />
                  : <MicNoneIcon />
          }
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="mic-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
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
      >
        <Box sx={{ px: 2, pt: 1.75, pb: 1.25 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Stack direction="row" alignItems="center" gap={1}>
              <SettingsVoiceIcon fontSize="small" />
              <Typography variant="subtitle1" fontWeight={700}>
                Microphone
              </Typography>
            </Stack>
            <Chip size="small" label={statusChip.label} color={statusChip.color} variant={statusChip.variant} />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Connect, mute, and choose an input device.
          </Typography>

          <Stack direction="row" gap={1} sx={{ mt: 1.5 }}>
            <Button
              fullWidth
              variant={isConnected ? 'outlined' : 'contained'}
              color={isConnected ? 'error' : 'primary'}
              onClick={handleConnectToggle}
              disabled={disabled || isBusy || !mic.inputDeviceId}
              startIcon={
                isBusy
                  ? <CircularProgress size={16} />
                  : (isConnected ? <MicExternalOffIcon fontSize="small" /> : <MicNoneIcon fontSize="small" />)
              }
            >
              {connectButtonLabel}
            </Button>
          </Stack>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => mic.setMuted(!mic.isMuted)}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {mic.isMuted ? <MicOffIcon color="error" fontSize="small" /> : <MicIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText
            primary="Mute"
            secondary={mic.isMuted ? 'Muted' : 'On'}
            slotProps={{
              primary: { fontWeight: 600 }
            }}
          />
          <Switch
            edge="end"
            checked={mic.isMuted}
            onChange={() => mic.setMuted(!mic.isMuted)}
          />
        </MenuItem>

        <Divider />

        <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
          <InputDevicesSelect
            disabled={disabled || isBusy || !devices.length || isConnected}
            currentInputDevice={mic.inputDeviceId ?? ''}
            setCurrentInputDevice={async (deviceId) => {
              await mic.setInputDevice(deviceId ?? null)
            }}
          />

          {
            !devices.length && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                No input devices found.
              </Typography>
            )
          }
        </Box>
      </Menu>
    </>
  )
}
