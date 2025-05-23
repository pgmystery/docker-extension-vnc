import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack } from '@mui/material'
import Button from '@mui/material/Button'
import QualityLevel from './VNCSettingForms/QualityLevel'
import { FormEvent, useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import CompressionLevel from './VNCSettingForms/CompressionLevel'
import ShowDotCursor from './VNCSettingForms/ShowDotCursor'
import ViewOnly from './VNCSettingForms/ViewOnly'
import { VNCSettings } from '../../stores/vncSettingsStore'
import Scaling, { ScalingResize } from './VNCSettingForms/Scaling'
import { DialogProps } from '@toolpad/core'
import PlayBellSound from './VNCSettingForms/PlayBellSound'


interface VNCSettingsSaveData extends Omit<VNCSettings, 'showDotCursor' | 'viewOnly' | 'scaling' | 'playBell'> {
  showDotCursor?: 'on'
  viewOnly?: 'on'
  playBell?: 'on'
  'scaling.clipToWindow'?: 'on'
  'scaling.resize': ScalingResize
}


export default function VNCSettingsDialog({ open, onClose, payload }: DialogProps<VNCSettings, null | VNCSettings>) {
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
        <Stack spacing={1}>
          <QualityLevel
            initValue={payload.qualityLevel}
            reset={reset}
          />
          <Divider />
          <CompressionLevel
            initValue={payload.compressionLevel}
            reset={reset}
          />
          <Divider />
          <ShowDotCursor
            initValue={payload.showDotCursor}
            reset={reset}
          />
          <Divider />
          <ViewOnly
            initValue={payload.viewOnly}
            reset={reset}
          />
          <Divider />
          <PlayBellSound
            initValue={payload.playBell}
            reset={reset}
          />
          <Divider />
          <Scaling
            initValue={payload.scaling}
            reset={reset}
          />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions
        sx={{
          justifyContent: 'flex-start',
        }}
      >
        <Button variant="outlined" onClick={() => setReset(true)} color="error">Reset</Button>
        <Box sx={ {flexGrow: 1} }/>
        <Button variant="outlined" onClick={() => onClose(null)}>Cancel</Button>
        <Button color="success" type="submit">Save & Reconnect</Button>
      </DialogActions>
    </Dialog>
  )
}
