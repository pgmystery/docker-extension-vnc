import { DialogProps } from '@toolpad/core'
import {
  Box, Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl, FormGroup, FormLabel,
  MenuItem,
  Select, SelectChangeEvent,
  Stack,
  TextField, Theme, useTheme
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import {
  DEFAULT_FPS,
  CanvasRecorderSettings,
  getMediaRecorderMimeTypes,
  DEFAULT_TIMESLICE, getMediaRecorderMimeTypeCodecs
} from '../../hooks/useCanvasRecorder'
import Button from '@mui/material/Button'


function getMimeTypeCodecsItemStyle(mimeTypeCodec: string, mimeTypeCodecs: readonly string[], theme: Theme) {
  return {
    fontWeight: mimeTypeCodecs.includes(mimeTypeCodec)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
  };
}

export default function CanvasRecordSettingsDialog({ open, onClose }: DialogProps<undefined, null | CanvasRecorderSettings>) {
  const theme = useTheme()
  const supportedMimeTypes = useMemo(() => getMediaRecorderMimeTypes(), [])
  const [mimeTypeExtension, setMimeTypeExtension] = useState<string>(supportedMimeTypes[0])
  const [mimeTypeAvailableCodecs, setMimeTypeAvailableCodecs] = useState<string[]>(getMediaRecorderMimeTypeCodecs(supportedMimeTypes[0]))
  const [mimeTypeCodecs, setMimeTypeCodecs] = useState<string[]>([])
  const [fps, setFps] = useState<number>(DEFAULT_FPS)
  const [timeslice, setTimeslice] = useState<number | undefined>(DEFAULT_TIMESLICE)

  function onMimeTypeChange(event: SelectChangeEvent) {
    const mimeTypeExtension = event.target.value

    setMimeTypeExtension(mimeTypeExtension)
    setMimeTypeAvailableCodecs(getMediaRecorderMimeTypeCodecs(mimeTypeExtension))
    setMimeTypeCodecs([])
  }

  function onMimeTypeCodecsChange(event: SelectChangeEvent<typeof mimeTypeCodecs>) {
    const { target: { value } } = event

    setMimeTypeCodecs(typeof value === 'string' ? value.split(',') : value)
  }

  function deleteCodecFromList(codec: string) {
    setMimeTypeCodecs(mimeTypeCodecs => mimeTypeCodecs.filter(currentCodec => currentCodec !== codec))
  }

  function getFullMimeType() {
    const mimeType = `video/${mimeTypeExtension}`

    if (mimeTypeCodecs.length === 0)
      return mimeType

    return `${mimeType}; codecs="${mimeTypeCodecs.join(', ')}"`
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
    >
      <DialogTitle>Canvas Recording Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <FormGroup sx={{width: '100%'}}>
            <FormLabel>Mime-Type:</FormLabel>
            <Stack spacing={1}>
              <Select
                value={mimeTypeExtension}
                onChange={onMimeTypeChange}
              >
                { supportedMimeTypes.map(mimeType => <MenuItem key={mimeType} value={mimeType}>{ mimeType }</MenuItem>) }
              </Select>
              <Select
                multiple
                value={mimeTypeCodecs}
                onChange={onMimeTypeCodecsChange}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={value}
                        onMouseDown={event => {
                          event.stopPropagation()
                        }}
                        onClick={event => {
                          event.stopPropagation()
                          deleteCodecFromList(value)
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {mimeTypeAvailableCodecs.map(mimeTypeCodec => (
                  <MenuItem
                    key={mimeTypeCodec}
                    value={mimeTypeCodec}
                    style={getMimeTypeCodecsItemStyle(mimeTypeCodec, mimeTypeCodecs, theme)}
                  >{mimeTypeCodec}</MenuItem>
                ))}
              </Select>
            </Stack>
          </FormGroup>
          <FormControl>
            <FormLabel>FPS:</FormLabel>
            <TextField
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
              value={fps}
              onChange={event => setFps(Number(event.target.value))}
              required
            />
          </FormControl>
          <FormControl>
            <FormLabel>Timeslice:</FormLabel>
            <TextField
              type="number"
              slotProps={{ htmlInput: { min: 0 } }}
              value={timeslice}
              onChange={event => setTimeslice(Number(event.target.value) === 0 ? undefined : Number(event.target.value))}
              required
            />
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => onClose(null)}>Cancel</Button>
        <Button color="success" onClick={() => {
          const mimeType = getFullMimeType()

          return onClose({
            mimeType,
            fps,
            timeslice,
          })}
        }>Start Recording...</Button>
      </DialogActions>
    </Dialog>
  )
}
