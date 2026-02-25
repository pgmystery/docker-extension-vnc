import { DialogProps } from '@toolpad/core'
import { useMemo, useReducer, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import DockerCli from '../../libs/docker/DockerCli'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, Divider,
  FormControlLabel,
  FormGroup, IconButton, Link,
  Typography
} from '@mui/material'
import TextStreamDialog from './TextStreamDialog'
import AnsiLogText from '../utils/AnsiLogText'
import installAudioScript from '../../resources/files/install_audio_support.sh?raw'
import truncate from '../../utils/truncate'
import { VNCHandler } from '../../hooks/useVNC'
import { Alert } from '@mui/lab'
import eventBus from '../../libs/EventBus'
import CloseIcon from '@mui/icons-material/Close'

interface InstallAudioDialogProps {
  containerId: string
  vncHandler: VNCHandler
  installedAudios: {
    input: boolean
    output: boolean
  }
}

export default function InstallAudioDialog({ open, onClose, payload }: DialogProps<InstallAudioDialogProps>) {
  const { containerId, vncHandler, installedAudios } = payload
  const ddClient = useMemo(createDockerDesktopClient, [])
  const [installing, setInstalling] = useState(false)
  const [finished, setFinished] = useState(false)
  const [stdout, dispatch] = useReducer(addStdout, [])

  const [audioOutput, setAudioOutput] = useState(true)
  const [audioInput, setAudioInput] = useState(false)

  function handleClose() {
    vncHandler.refreshAudioData()

    onClose()
  }

  async function handleInstall() {
    setInstalling(true)
    setFinished(false)
    const dockerCli = new DockerCli(ddClient.docker)
    const targetPath = '/tmp/install_audio_support.sh'

    try {
      // 1. Copy script to container
      dispatch('Copying installation script to container...')
      await dockerCli.copyContentToContainer(containerId, installAudioScript, targetPath)

      // 2. Build arguments
      const args = [targetPath]
      if (audioOutput) args.push('--audio-output')
      if (audioInput) args.push('--audio-input')

      // 3. Exec script
      dispatch(`Executing script with args: ${args.join(' ')}`)
      await dockerCli.execStream(
        'exec',
        ['-u', '0', containerId, ...args],
        {
          onStdout: dispatch,
          onStderr: dispatch,
        }
      )

      dispatch('Installation Complete!')
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e))
      const exitCode = (err as any).exitCode
      const details = (err as any).stderr || err.message || (exitCode != null ? `Exit code: ${exitCode}` : 'Unknown error')
      onFatalError(details)
    } finally {
      setFinished(true)
    }
  }

  function addStdout(stdout: string[], data: string) {
    return [
      ...stdout,
      data,
    ]
  }

  function onFatalError(error: string) {
    console.error(error)
    ddClient.desktopUI.toast.error(error)
  }

  if (installing) {
    return (
      <TextStreamDialog
        open={open}
        title={`Installing Audio Support (${truncate(containerId, 16, '')})`}
        finished={finished}
      >
        <AnsiLogText text={stdout.join('\n')} />
        {finished && (
          <Button onClick={() => handleClose()} sx={{ mt: 2 }} variant="contained">
            Close
          </Button>
        )}
      </TextStreamDialog>
    )
  }

  return (
    <Dialog open={open} onClose={() => handleClose()}>
      <DialogTitle>Install Audio Support</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => handleClose()}
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
        <DialogContentText sx={{ mb: 2 }}>
          Install PulseAudio and FFmpeg to enable audio streaming for container:
          <Typography sx={{fontWeight: 'bold'}}>{truncate(containerId, 16, '')}</Typography>
        </DialogContentText>
        <Alert severity="info" sx={{ mb: 2 }}>
          For more information about the audio setup process, please refer to the <Link color="inherit" component="button" onClick={() => {
          eventBus.emit('openUrl', 'https://github.com/pgmystery/docker-extension-vnc/tree/main/docs/audio')
        }}>Audio Setup Guide</Link>.
        </Alert>
        <FormGroup>
          { !installedAudios.output &&
            <FormControlLabel
              control={<Checkbox checked={audioOutput} onChange={(e) => setAudioOutput(e.target.checked)} />}
              label="Enable Audio Output (Container -> Browser) (Speaker)"
            />
          }
          { !installedAudios.input &&
            <FormControlLabel
              control={<Checkbox checked={audioInput} onChange={(e) => setAudioInput(e.target.checked)} />}
              label="Enable Audio Input (Browser -> Container) (Microphone)"
            />
          }
        </FormGroup>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button variant="outlined" onClick={() => handleClose()}>Cancel</Button>
        <Button
          onClick={handleInstall}
          variant="contained"
          color="success"
          disabled={!audioInput && !audioOutput}
        >
          Install
        </Button>
      </DialogActions>
    </Dialog>
  )
}
