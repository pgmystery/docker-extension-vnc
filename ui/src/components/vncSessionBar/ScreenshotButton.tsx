import { IconButton, Tooltip } from '@mui/material'
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor'
import { getDateTime } from '../../utils/dateTime'


interface ScreenshotButtonProps {
  canvas?: HTMLCanvasElement
}


export default function ScreenshotButton({ canvas }: ScreenshotButtonProps) {
  function handleClick() {
    if (!canvas)
      return

    const screenshotData = canvas.toDataURL("image/png")
    const linkElement = document.createElement('a')

    linkElement.href = screenshotData
    linkElement.download = `${getDateTime()}.png`
    linkElement.click()
  }

  return (
    <Tooltip title="Take Screenshot" arrow>
      <IconButton onClick={handleClick} disabled={!canvas}>
        <ScreenshotMonitorIcon/>
      </IconButton>
    </Tooltip>
  )
}
