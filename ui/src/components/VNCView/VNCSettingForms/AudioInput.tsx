import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Stack,
  Tooltip,
  FormGroup, Switch
} from '@mui/material'
import eventBus from '../../../libs/EventBus'
import InfoIcon from '@mui/icons-material/Info'
import React, { useEffect, useState } from 'react'
import MicOffIcon from '@mui/icons-material/MicOff'
import InputDevicesSelect from './base/audio/InputDevicesSelect'

export const AudioInputDefault = {
  enabled: true,
  muted: false,
}

export type AudioInputSettings = {
  enabled: boolean
  muted: boolean
  device?: string
}

type AudioInputProps = {
  initValue?: AudioInputSettings
  reset: boolean
}

export default function AudioInput({ initValue, reset }: AudioInputProps) {
  const [enabled, setEnabled] = useState<boolean>(initValue?.enabled ?? AudioInputDefault.enabled)
  const [currentInputDevice, setCurrentInputDevice] = useState<string | undefined>(initValue?.device)
  const [muted, setMuted] = useState<boolean>(initValue?.muted ?? AudioInputDefault.muted)

  useEffect(() => {
    if (!reset)
      return

    setEnabled(AudioInputDefault.enabled)
    setMuted(AudioInputDefault.muted)
    setCurrentInputDevice(undefined)
  }, [reset])

  return (
    <FormControl>
      <FormLabel>
        Audio Input
        <Tooltip title="Open Audio output Documentation">
          <IconButton
            size="small"
            onClick={() => eventBus.emit('openUrl', 'https://github.com/pgmystery/docker-extension-vnc/blob/main/docs/audio/README.md')}
            sx={{ ml: 1 }}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </FormLabel>

      <Stack direction="column" spacing={2} mt={1}>
        <FormGroup>
          <FormControlLabel control={<Switch
            checked={enabled}
            onChange={e => {
              setEnabled(e.target.checked)
            }}
            name="audio.input.enabled"
          />} label="Enable Audio Input" />
        </FormGroup>

        <InputDevicesSelect
          currentInputDevice={currentInputDevice}
          setCurrentInputDevice={setCurrentInputDevice}
        />

        <Stack direction="row" alignItems="center">
          <MicOffIcon />
          <FormControlLabel
            control={
              <Checkbox
                checked={muted}
                onChange={(e) => setMuted(e.target.checked)}
                name="audio.input.muted"
              />
            }
            label="Mute Audio Input"
          />
        </Stack>
      </Stack>
    </FormControl>
  )
}
