import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  ListSubheader,
  Menu,
  Tooltip,
  Typography
} from '@mui/material'
import { MouseEvent, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import ClipboardField from '../inputs/ClipboardField'


interface ClipboardMenuProps {
  clipboardText: string
  sendClipboardText?: (text: string)=>void
  disabled?: boolean
}

export default function ClipboardMenu({ clipboardText, sendClipboardText, disabled }: ClipboardMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [textareaValue, setTextareaValue] = useState<string>('')
  const [textIsHidden, setTextIsHidden] = useState<boolean>(false)

  useEffect(() => {
    setTextareaValue(clipboardText)
  }, [clipboardText])

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Show Clipboard">
        <IconButton
          onClick={ handleClick }
          size="small"
          aria-controls={ open ? 'clipboard-menu' : undefined }
          aria-haspopup="true"
          aria-expanded={ open ? 'true' : undefined }
          disabled={ disabled }
        >
          <ContentPasteIcon/>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={ anchorEl }
        id="clipboard-menu"
        open={ open }
        onClose={ handleClose }
        slotProps={ {
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        } }
        transformOrigin={ {horizontal: 'left', vertical: 'top'} }
        anchorOrigin={ {horizontal: 'left', vertical: 'bottom'} }
      >
        <ListSubheader>Clipboard</ListSubheader>
        <Typography>Edit clipboard content in the textarea below.</Typography>
        <ClipboardField
          autoFocus
          value={textareaValue}
          setValue={value => setTextareaValue(value)}
          isPassword={textIsHidden}
        />
        <FormControlLabel
          control={
            <Checkbox checked={textIsHidden} onChange={event => setTextIsHidden(event.target.checked)} />
          }
          label="Password input"
        />
        {
          sendClipboardText &&
          <Button sx={{height: '25px'}} onClick={() => sendClipboardText(textareaValue)}>Send to Clipboard</Button>
        }
      </Menu>
    </>
  )
}
