import { MouseEvent, ReactNode } from 'react'
import {
  Avatar,
  Box, Divider,
  IconButton,
  ListItemIcon,
  ListSubheader,
  Menu,
  MenuItem, Stack,
  Tooltip,
  Typography
} from '@mui/material'
import KeyboardHideIcon from '@mui/icons-material/KeyboardHide'
import { useState } from 'react'
import CtrlIcon from '../../resources/icons/ctrl.svg?react'
import AltIcon from '../../resources/icons/alt.svg?react'
import WindowsIcon from '../../resources/icons/windows.svg?react'
import TabIcon from '../../resources/icons/tab.svg?react'
import EscIcon from '../../resources/icons/esc.svg?react'
import CtrlAltDelIcon from '../../resources/icons/ctrlaltdel.svg?react'
import { VncScreenHandle } from 'react-vnc'
import { Check } from '@mui/icons-material'


interface SendKeysMenuProps extends Partial<Pick<VncScreenHandle, 'sendKey' | 'sendCtrlAltDel'>> {
  disabled?: boolean
}
interface SendKeysMenuItemToggleProps {
  label: string
  icon: ReactNode
  selected: boolean
}


// https://docs.rs/x11-dl/1.0.1/x11_dl/keysym/
export default function SendKeysMenu({ sendKey, sendCtrlAltDel, disabled }: SendKeysMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [ctrlKeyDown, setCtrlKeyDown] = useState<boolean>(false)
  const [altKeyDown, setAltKeyDown] = useState<boolean>(false)
  const [windowsKeyDown, setWindowsKeyDown] = useState<boolean>(false)

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function toggleKey(isDown: boolean, rfbKeysym: number, key: string) {
    isDown
      ? sendKeyDown(rfbKeysym, key)
      : sendKeyUp(rfbKeysym, key)
  }

  function sendKeyDown(rfbKeysym: number, key: string) {
    if (sendKey)
      sendKey(rfbKeysym, key, true)
  }

  function sendKeyUp(rfbKeysym: number, key: string) {
    if (sendKey)
      sendKey(rfbKeysym, key, false)
  }

  function sendKeyToVNCView(rfbKeysym: number, key: string) {
    handleClose()

    if (sendKey)
      sendKey(rfbKeysym, key)
  }

  function handleClickKeyCtrlAltDel() {
    handleClose()

    if (sendCtrlAltDel)
      sendCtrlAltDel()
  }

  return (
    <>
      <Tooltip title="Show Keys" arrow>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'key-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          disabled={disabled}
        >
          <KeyboardHideIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="key-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
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
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <ListSubheader>Toggle keys</ListSubheader>

        {/*https://github.com/novnc/noVNC/blob/master/core/input/keysym.js#L193C37-L193C43*/}
        <MenuItem
          onClick={() => {
            toggleKey(!ctrlKeyDown, 0xffe3, 'ControlLeft')
            setCtrlKeyDown(!ctrlKeyDown)
          }}
          selected={ctrlKeyDown}
        >
          <SendKeysMenuItemToggle
            label="Control"
            icon={<CtrlIcon />}
            selected={ctrlKeyDown}
          />
        </MenuItem>

        {/*https://github.com/novnc/noVNC/blob/master/core/input/keysym.js#L200C37-L200C43*/}
        <MenuItem
          onClick={() => {
            toggleKey(!altKeyDown, 0xffe9, 'AltLeft')
            setAltKeyDown(!altKeyDown)
          }}
          selected={altKeyDown}
        >
          <SendKeysMenuItemToggle
            label="Alt"
            icon={<AltIcon />}
            selected={altKeyDown}
          />
        </MenuItem>

        {/*https://github.com/novnc/noVNC/blob/master/core/input/keysym.js#L202C37-L202C43*/}
        <MenuItem
          onClick={() => {
            toggleKey(!windowsKeyDown, 0xffeb, 'MetaLeft')
            setWindowsKeyDown(!windowsKeyDown)
          }}
          selected={windowsKeyDown}
        >
          <SendKeysMenuItemToggle
            label="Windows"
            icon={<WindowsIcon />}
            selected={windowsKeyDown}
          />
        </MenuItem>

        <Divider />
        <ListSubheader>Send keys</ListSubheader>

        {/*https://github.com/novnc/noVNC/blob/master/core/input/keysym.js#L7C37-L7C43*/}
        <MenuItem onClick={() => sendKeyToVNCView(0xff09, 'Tab')}>
          <Avatar>
            <TabIcon />
          </Avatar> Tab
        </MenuItem>

        {/*https://github.com/novnc/noVNC/blob/master/core/input/keysym.js#L14C37-L14C43*/}
        <MenuItem onClick={() => sendKeyToVNCView(0xff1b, 'Escape')}>
          <Avatar>
            <EscIcon />
          </Avatar> Escape
        </MenuItem>

        <MenuItem onClick={handleClickKeyCtrlAltDel}>
          <Avatar>
            <CtrlAltDelIcon />
          </Avatar> Ctrl & Alt & Del
        </MenuItem>
      </Menu>
    </>
  )
}

function SendKeysMenuItemToggle({ label, icon, selected }: SendKeysMenuItemToggleProps) {
  return (
    <Stack direction="row" alignContent="center" alignItems="center" sx={{width: '100%'}}>
      <Avatar>
        { icon }
      </Avatar>
      <Typography>{ label }</Typography>
      <Box sx={{flexGrow: 1}} />
      {
        selected &&
        <ListItemIcon sx={{display: 'flex', justifyContent: 'right'}}>
          <Check />
        </ListItemIcon>
      }
    </Stack>
  )
}
