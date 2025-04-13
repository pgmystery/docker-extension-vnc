import VideocamIcon from '@mui/icons-material/Videocam'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { IconButton, Tooltip } from '@mui/material'
import useCanvasRecorder, { CanvasRecorderState } from '../../hooks/useCanvasRecorder'
import { getDateTime } from '../../utils/dateTime'
import { useEffect } from 'react'
import { useDialogs } from '@toolpad/core'
import CanvasRecordSettingsDialog from '../dialogs/CanvasRecordSettingsDialog'
import PendingIcon from '@mui/icons-material/Pending'


interface RecordButtonProps {
  canvas?: HTMLCanvasElement
}
interface RecordButtonComponentProps {
  canvas: HTMLCanvasElement
}

interface RecordButtonIconProps {
  state: CanvasRecorderState
  onStop: ()=>void
  onStart: ()=>void
}


export default function RecordButton({ canvas }: RecordButtonProps) {
  return canvas
    ? <RecordButtonComponent canvas={canvas} />
    : <Tooltip title="Record VNC-Screen" arrow>
        <IconButton disabled>
          <VideocamIcon/>
        </IconButton>
      </Tooltip>
}

function RecordButtonComponent({ canvas }: RecordButtonComponentProps) {
  const canvasRecorder = useCanvasRecorder()
  const dialogs = useDialogs()

  useEffect(() => {
    return () => {
      if (canvasRecorder.state === 'recording' && canvasRecorder.mediaRecorder?.state === 'recording')
        stopRecording()
    }
  }, [canvasRecorder])

  async function startRecording() {
    const recorderSettings = await dialogs.open(CanvasRecordSettingsDialog)
    if (!recorderSettings)
      return

    canvasRecorder.start(canvas, recorderSettings)
  }

  function stopRecording() {
    canvasRecorder.stop(`${getDateTime()}${canvasRecorder.getFileExtension() || ''}`)
  }

  return <RecordButtonIcon
    state={canvasRecorder.state}
    onStart={startRecording}
    onStop={stopRecording}
  />
}

function RecordButtonIcon({ state, onStop, onStart }: RecordButtonIconProps) {
  switch (state) {
    case 'offline':
      return (
        <Tooltip title="Record VNC-Screen" arrow>
          <IconButton onClick={onStart}>
            <VideocamIcon/>
          </IconButton>
        </Tooltip>
      )
    case 'recording':
      return (
        <Tooltip title="Stop Recording" arrow>
          <IconButton
            sx={theme => ({
              'svg': {
                borderRadius: '50%',
                "@keyframes recording": {
                  "0%": {
                    color: theme.palette.primary.main,
                    boxShadow: 'none',
                  },
                  "100%": {
                    color: theme.palette.error.main,
                    boxShadow: `0px 0px 10px 10px ${theme.palette.error.main}`,
                  }
                },
                animationName: 'recording',
                animationDuration: '1s',
                animationIterationCount: 'infinite',
                animationDirection: 'alternate',
              },
            })}
            onClick={onStop}
          >
            <FiberManualRecordIcon/>
          </IconButton>
        </Tooltip>
      )
    case 'pending':
      return (
        <Tooltip title="Pending..." arrow>
          <IconButton
            sx={theme => ({
              color: theme.palette.warning.main,
            })}
            onClick={onStop}
          >
            <PendingIcon/>
          </IconButton>
        </Tooltip>
      )
  }
}
