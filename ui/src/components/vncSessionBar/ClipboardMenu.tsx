import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import { IconButton, ListSubheader, Menu, styled, TextareaAutosize, Tooltip, Typography } from '@mui/material'
import { MouseEvent, useEffect, useState } from 'react'
import Button from '@mui/material/Button'


interface ClipboardMenuProps {
  clipboardText: string
  sendClipboardText?: (text: string)=>void
}

export default function ClipboardMenu({ clipboardText, sendClipboardText }: ClipboardMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [textareaValue, setTextareaValue] = useState<string>('')

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
              // mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              // '&::before': {
              //   content: '""',
              //   display: 'block',
              //   position: 'absolute',
              //   top: 0,
              //   left: 10,
              //   width: 10,
              //   height: 10,
              //   bgcolor: 'background.paper',
              //   transform: 'translateY(-50%) rotate(45deg)',
              //   zIndex: 0,
              // },
            },
          },
        } }
        transformOrigin={ {horizontal: 'right', vertical: 'top'} }
        anchorOrigin={ {horizontal: 'right', vertical: 'bottom'} }
      >
        <ListSubheader>Clipboard</ListSubheader>
        <Typography>Edit clipboard content in the textarea below.</Typography>
        <Textarea
          autoFocus
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.currentTarget.value)}
        />
        {
          sendClipboardText &&
          <Button sx={{height: '25px'}} onClick={() => sendClipboardText(textareaValue)}>Send to Clipboard</Button>
        }
      </Menu>
    </>
  )
}

const Textarea = styled(TextareaAutosize)(() => `
  min-height: 50px;
  margin-bottom: 10px;
`)
