import React, { ChangeEvent, useEffect, useState } from 'react'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Input,
  Slider,
  Stack,
  Switch,
  Tooltip
} from '@mui/material'
import { VolumeDown, VolumeUp } from '@mui/icons-material'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import eventBus from '../../../libs/EventBus'
import InfoIcon from '@mui/icons-material/Info'


export const AudioOutputDefault = {
  default: {
    enabled: true,
    volume: 50,
    muted: false,
  },
  min: 0,
  max: 100,
}

export type AudioOutputSettings = {
  enabled: boolean
  volume: number
  muted: boolean
}

type AudioOutputProps = {
  initValue?: AudioOutputSettings
  reset: boolean
}

export default function AudioOutput({ initValue, reset }: AudioOutputProps) {
  const [enabled, setEnabled] = useState<boolean>(initValue?.enabled ?? AudioOutputDefault.default.enabled)
  const [volume, setVolume] = useState<number>(initValue?.volume ?? AudioOutputDefault.default.volume)
  const [muted, setMuted] = useState<boolean>(initValue?.muted ?? AudioOutputDefault.default.muted)

  useEffect(() => {
    if (!reset)
      return

    setEnabled(AudioOutputDefault.default.enabled)
    setVolume(AudioOutputDefault.default.volume)
    setMuted(AudioOutputDefault.default.muted)
  }, [reset])

  function handleSliderChange(_: Event, newValue: number | number[]) {
    setVolume(newValue as number)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVolume(event.target.value === '' ? 0 : Number(event.target.value))
  }

  const handleBlur = () => {
    if (volume < AudioOutputDefault.min) {
      setVolume(AudioOutputDefault.min)
    } else if (volume > AudioOutputDefault.max) {
      setVolume(AudioOutputDefault.max)
    }
  }

  return (
    <FormControl>
      <FormLabel>
        Audio Output
        <Tooltip title="Open Audio output Documentation" >
          <IconButton
            size="small"
            onClick={() => eventBus.emit('openUrl', 'https://github.com/pgmystery/docker-extension-vnc/tree/main/docs/audio#audio-output-container-%EF%B8%8F-browser')}
            sx={{
              ml: 1,
            }}
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
            name="audio.output.enabled"
          />} label="Enable Audio Output" />
        </FormGroup>

        <Box>
          <FormLabel>Volume</FormLabel>
          <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
            <VolumeDown />
            <Slider
              min={AudioOutputDefault.min}
              max={AudioOutputDefault.max}
              value={volume}
              onChange={handleSliderChange}
            />
            <VolumeUp />
            <Input
              name="audio.output.volume"
              value={volume}
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
              slotProps={{
                input: {
                  step: 1,
                  min: AudioOutputDefault.min,
                  max: AudioOutputDefault.max,
                  type: 'number',
                },
              }}
            />
          </Stack>
        </Box>

        <Stack direction="row" alignItems="center">
          <VolumeOffIcon />
          <FormControlLabel
            control={
              <Checkbox
                checked={muted}
                onChange={(e) => setMuted(e.target.checked)}
                name="audio.output.muted"
              />
            }
            label="Mute Audio Output"
          />
        </Stack>
      </Stack>
    </FormControl>
  )
}
