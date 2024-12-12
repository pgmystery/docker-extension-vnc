import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack } from '@mui/material'
import Button from '@mui/material/Button'
import QualityLevel from './VNCSettingForms/QualityLevel'
import { FormEvent, useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import CompressionLevel from './VNCSettingForms/CompressionLevel'
import ShowDotCursor from './VNCSettingForms/ShowDotCursor'
import ViewOnly from './VNCSettingForms/ViewOnly'
import { VNCSettings } from '../../stores/vncSettingsStore'


interface VNCSettingsSaveData extends Omit<VNCSettings, 'showDotCursor'> {
  showDotCursor?: 'on'
}

interface VNCSettingsDialog {
  open: boolean
  close: ()=>void
  settingsData: VNCSettings
  onSettingChange: (settingsData: VNCSettings)=>void
}


export default function VNCSettingsDialog({ open, close, settingsData, onSettingChange }: VNCSettingsDialog) {
  const [reset, setReset] = useState<boolean>(false)

  useEffect(() => {
    if (reset) setReset(false)
  }, [reset])

  function save(data: VNCSettingsSaveData) {
    onSettingChange({
      qualityLevel: Number(data.qualityLevel),
      compressionLevel: Number(data.compressionLevel),
      showDotCursor: !!data.showDotCursor,
      viewOnly: data.viewOnly,
    })
    close()
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth={true}
      PaperProps={{
        component: 'form',
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget)
          const formJson = Object.fromEntries((formData as any).entries()) as VNCSettingsSaveData

          save(formJson)
        },
      }}
    >
      <DialogTitle>VNC Settings</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={close}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Stack spacing={1}>
          <QualityLevel
            initValue={settingsData.qualityLevel}
            reset={reset}
          />
          <Divider />
          <CompressionLevel
            initValue={settingsData.compressionLevel}
            reset={reset}
          />
          <Divider />
          <ShowDotCursor
            initValue={settingsData.showDotCursor}
            reset={reset}
          />
          <Divider />
          <ViewOnly
            initValue={settingsData.viewOnly}
            reset={reset}
          />
          <Divider />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReset(true)} color="error">Reset</Button>
        <Button color="success" type="submit">Save & Reconnect</Button>
      </DialogActions>
    </Dialog>
  )
}
