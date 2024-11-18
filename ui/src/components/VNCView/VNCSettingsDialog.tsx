import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack } from '@mui/material'
import Button from '@mui/material/Button'
import QualityLevel from './VNCSettingForms/QualityLevel'
import { useEffect, useState } from 'react'
import DeleteCredentials from './VNCSettingForms/DeleteCredentials'
import { VNCSettingsData } from './VNCView'
import CloseIcon from '@mui/icons-material/Close'
import CompressionLevel from './VNCSettingForms/CompressionLevel'
import ShowDotCursor from './VNCSettingForms/ShowDotCursor'


interface VNCSettingsDialog {
  open: boolean
  close: ()=>void
  settingsData: VNCSettingsData
  onSettingChange: (settingsData: VNCSettingsData)=>void
}


export default function VNCSettingsDialog({ open, close, settingsData, onSettingChange }: VNCSettingsDialog) {
  const [settings, setSettings] = useState<VNCSettingsData>(settingsData)
  const [reset, setReset] = useState<boolean>(false)

  useEffect(() => {
    if (reset) setReset(false)
  }, [reset])

  function save() {
    onSettingChange(settings)
    close()
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth={true}
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
            onChange={qualityLevel => setSettings({
              ...settingsData,
              qualityLevel,
            })}
          />
          <Divider />
          <CompressionLevel
            initValue={settingsData.compressionLevel}
            reset={reset}
            onChange={compressionLevel => setSettings({
              ...settingsData,
              compressionLevel,
            })}
          />
          <Divider />
          <ShowDotCursor
            initValue={settingsData.showDotCursor}
            reset={reset}
            onChange={showDotCursor => setSettings({
              ...settingsData,
              showDotCursor,
            })}
          />
          <Divider />
          <DeleteCredentials />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReset(true)} color="error">Reset</Button>
        <Button color="success" onClick={save}>Save & Reconnect</Button>
      </DialogActions>
    </Dialog>
  )
}
