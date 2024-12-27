import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack
} from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'


export const ScalingDefault: ScalingSettings = {
  clipToWindow: false,
  resize: 'scale',
}


export interface ScalingSettings {
  clipToWindow: boolean
  resize: ScalingResize
}
export type ScalingResize = 'off' | 'scale' | 'remote'
interface ScalingProps {
  initValue?: ScalingSettings
  reset: boolean
}


export default function Scaling({ initValue, reset }: ScalingProps) {
  const [clipToWindow, setClipToWindow] = useState<boolean>(initValue?.clipToWindow || ScalingDefault.clipToWindow)
  const [resize, setResize] = useState<ScalingResize>(initValue?.resize || ScalingDefault.resize)

  useEffect(() => {
    if (!reset) return

    setClipToWindow(ScalingDefault.clipToWindow)
    setResize(ScalingDefault.resize)
  }, [reset])

  useEffect(() => {
    if (resize === 'scale')
      setClipToWindow(false)
  }, [resize])

  function handleClipToWindowChange(event: ChangeEvent<HTMLInputElement>) {
    setClipToWindow(event.target.checked)
  }

  function handleResizeChange(event: SelectChangeEvent<ScalingResize>) {
    setResize(event.target.value as ScalingResize)
  }

  return (
    <FormControl>
      <FormLabel>Scaling</FormLabel>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              name="scaling.clipToWindow"
              checked={clipToWindow}
              onChange={handleClipToWindowChange}
              disabled={resize === 'scale'}
              sx={{marginRight: '5px'}}
            />
          }
          label="Clip to Window"
        />

        <Select
          name="scaling.resize"
          value={resize}
          onChange={handleResizeChange}
        >
          <MenuItem value="off">None</MenuItem>
          <MenuItem value="scale">Local Scaling</MenuItem>
          <MenuItem value="remote">Remote Resizing</MenuItem>
        </Select>
      </Stack>
    </FormControl>
  )
}
