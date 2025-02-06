import { IconButton, InputAdornment, Stack, TextField } from '@mui/material'
import Button from '@mui/material/Button'
import { useMemo, useState } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import useOpenDialog from '../../hooks/useOpenDialog'

interface PathFieldProps {
  type: 'file' | 'directory'
  initialValue?: string
  browseText?: string
  label?: string
  browseDisabled?: boolean
  inputDisabled?: boolean
  noClearButton?: boolean
  openDialogTitle?: string
  openDialogMessage?: string
  openDialogDefaultPath?: string
  openDialogButtonLabel?: string
  openDialogFilters?: {
    name: string
    extensions: string[]
  }[]
}

export default function PathField({
  type,
  initialValue,
  browseText,
  label,
  browseDisabled,
  inputDisabled,
  noClearButton,
  openDialogTitle,
  openDialogMessage,
  openDialogDefaultPath,
  openDialogButtonLabel,
  openDialogFilters,
}: PathFieldProps) {
  const [value, setValue] = useState<string>(initialValue || '')
  const openDialogType = useMemo(() => type === 'file' ? 'openFile' : 'openDirectory', [type])
  const { showOpenDialog, isOpenDialogShowing } = useOpenDialog()

  async function handleBrowseClick() {
    const result = await showOpenDialog({
      title: openDialogTitle,
      message: openDialogMessage,
      defaultPath: openDialogDefaultPath,
      buttonLabel: openDialogButtonLabel,
      filters: openDialogFilters,
      properties: [openDialogType, 'showHiddenFiles'],
    })

    if (!result.canceled && result.filePaths.length > 0) {
      setValue(result.filePaths[0])
    }
  }

  return (
    <Stack direction="row" spacing={1}>
      <TextField
        label={label}
        disabled={inputDisabled}
        value={value}
        sx={{
          flexGrow: 1,
        }}
        margin="none"
        slotProps={noClearButton ? undefined : {
          input: {
            endAdornment: value !== '' && (
              <InputAdornment position="end">
                <IconButton
                  title="Clear"
                  onClick={() => setValue('')}
                  onMouseDown={e => e.preventDefault()}
                  onMouseUp={e => e.preventDefault()}
                  edge="end"
                >
                  { <ClearIcon /> }
                </IconButton>
              </InputAdornment>
            )
          },
        }}
      />
      <Button
        size="small"
        disabled={browseDisabled || isOpenDialogShowing}
        onClick={handleBrowseClick}
        color="secondary"
      >
        { browseText || 'Browse' }
      </Button>
    </Stack>
  )
}
