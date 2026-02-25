import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tab,
} from '@mui/material'
import { TabContext, TabList } from '@mui/lab'
import Button from '@mui/material/Button'
import { FormEvent, useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { VNCSettings } from '../../stores/vncSettingsStore'
import { ScalingResize } from './VNCSettingForms/Scaling'
import { DialogProps } from '@toolpad/core'
import VncSettingTab from './tabs/VncSettingTab'
import DisplaySettingTab from './tabs/DisplaySettingTab'
import AudioSettingTab from './tabs/AudioSettingTab'
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings'
import TuneIcon from '@mui/icons-material/Tune'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'


interface VNCSettingsSaveData extends Omit<VNCSettings, 'showDotCursor' | 'viewOnly' | 'scaling' | 'playBell' | 'showHiddenContainerWarning' | 'audio'> {
  showDotCursor?: 'on'
  viewOnly?: 'on'
  playBell?: 'on'
  showHiddenContainerWarning?: 'on'
  'scaling.clipToWindow'?: 'on'
  'scaling.resize': ScalingResize
  'audio.output.enabled'?: 'on'
  'audio.output.volume': string
  'audio.output.muted'?: 'on'
  'audio.input.enabled'?: 'on'
  'audio.input.muted'?: 'on'
  'audio.input.device'?: string
}


export default function VNCSettingsDialog({ open, onClose, payload }: DialogProps<VNCSettings, null | VNCSettings>) {
  const [selectedTab, setSelectedTab] = useState<string>('0')
  const [reset, setReset] = useState<boolean>(false)

  useEffect(() => {
    if (reset) setReset(false)
  }, [reset])

  function save(data: VNCSettingsSaveData) {
    onClose({
      qualityLevel: Number(data.qualityLevel),
      compressionLevel: Number(data.compressionLevel),
      showDotCursor: !!data.showDotCursor,
      viewOnly: !!data.viewOnly,
      playBell: !!data.playBell,
      scaling: {
        clipToWindow: !!data['scaling.clipToWindow'],
        resize: data['scaling.resize'],
      },
      showHiddenContainerWarning: !!data.showHiddenContainerWarning,
      audio: {
        output: {
          enabled: !!data['audio.output.enabled'],
          volume: Number(data['audio.output.volume']),
          muted: !!data['audio.output.muted'],
        },
        input: {
          enabled: !!data['audio.input.enabled'],
          muted: !!data['audio.input.muted'],
          device: data['audio.input.device'],
        },
      },
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries((formData as any).entries()) as VNCSettingsSaveData

    save(formJson)
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      maxWidth="sm"
      fullWidth={true}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
        }
      }}
    >
      <DialogTitle>VNC Settings</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => onClose(null)}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <Divider />
      <DialogContent>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={(_, newValue) => setSelectedTab(newValue)}
              aria-label="VNC Settings tabs"
            >
              <Tab label="VNC View" value="0" icon={<DisplaySettingsIcon />} iconPosition="start" />
              <Tab label="Display & Control" value="1" icon={<TuneIcon />} iconPosition="start" />
              <Tab label="Audio" value="2" icon={<AudiotrackIcon />} iconPosition="start" />
            </TabList>
          </Box>
          <VncSettingTab
            payload={payload}
            reset={reset}
            value="0"
          />
          <DisplaySettingTab
            payload={payload}
            reset={reset}
            value="1"
          />
          <AudioSettingTab
            payload={payload}
            reset={reset}
            value="2"
          />
        </TabContext>
      </DialogContent>
      <Divider />
      <DialogActions
        sx={{
          justifyContent: 'flex-start',
        }}
      >
        <Button variant="outlined" onClick={() => setReset(true)} color="error">Reset</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" onClick={() => onClose(null)}>Cancel</Button>
        <Button color="success" type="submit">Save & Reconnect</Button>
      </DialogActions>
    </Dialog>
  )
}
