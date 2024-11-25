import { MouseEvent } from 'react'
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
import ctrlIcon from '../../resources/icons/ctrl.svg'
import altIcon from '../../resources/icons/alt.svg'
import windowsIcon from '../../resources/icons/windows.svg'
import tabIcon from '../../resources/icons/tab.svg'
import escIcon from '../../resources/icons/esc.svg'
import ctrlAltDelIcon from '../../resources/icons/ctrlaltdel.svg'
import { VncScreenHandle } from 'react-vnc'
import { Check } from '@mui/icons-material'


interface SendKeysMenuProps extends Partial<Pick<VncScreenHandle, 'sendKey' | 'sendCtrlAltDel'>> {}
interface SendKeysMenuItemToggleProps {
  label: string
  icon: string
  selected: boolean
}


// https://docs.rs/x11-dl/1.0.1/x11_dl/keysym/
export default function SendKeysMenu({ sendKey, sendCtrlAltDel }: SendKeysMenuProps) {
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
    <Box>
      <Tooltip title="Show Keys" arrow>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <KeyboardHideIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
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
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <ListSubheader>Toggle keys</ListSubheader>

        {/*https://docs.rs/x11-dl/1.0.1/x11_dl/keysym/constant.XK_Control_L.html*/}
        <MenuItem
          onClick={() => {
            toggleKey(!ctrlKeyDown, 65507, 'ControlLeft')
            setCtrlKeyDown(!ctrlKeyDown)
          }}
          selected={ctrlKeyDown}
        >
          <SendKeysMenuItemToggle
            label="Ctrl"
            icon={ctrlIcon}
            selected={ctrlKeyDown}
          />
        </MenuItem>

        {/*https://docs.rs/x11-dl/1.0.1/x11_dl/keysym/constant.XK_Alt_L.html*/}
        <MenuItem
          onClick={() => {
            toggleKey(!altKeyDown, 65513, 'AltLeft')
            setAltKeyDown(!altKeyDown)
          }}
          selected={altKeyDown}
        >
          <SendKeysMenuItemToggle
            label="Alt"
            icon={altIcon}
            selected={altKeyDown}
          />
        </MenuItem>

        {/*https://docs.rs/x11-dl/1.0.1/x11_dl/keysym/constant.XK_Win_L.html*/}
        <MenuItem
          onClick={() => {
            toggleKey(!windowsKeyDown, 65371, 'MetaLeft')
            setWindowsKeyDown(!windowsKeyDown)
          }}
          selected={windowsKeyDown}
        >
          <SendKeysMenuItemToggle
            label="Windows"
            icon={windowsIcon}
            selected={windowsKeyDown}
          />
        </MenuItem>

        <Divider />
        <ListSubheader>Send keys</ListSubheader>

        {/*https://docs.rs/x11-dl/1.0.1/x11_dl/keysym/constant.XK_Tab.html*/}
        <MenuItem onClick={() => sendKeyToVNCView(65289, 'Tab')}>
          <Avatar src={tabIcon} /> Tab
        </MenuItem>

        {/*https://docs.rs/x11-dl/1.0.1/x11_dl/keysym/constant.XK_Escape.html*/}
        <MenuItem onClick={() => sendKeyToVNCView(65307, 'Escape')}>
          <Avatar src={escIcon} /> Esc
        </MenuItem>

        <MenuItem onClick={handleClickKeyCtrlAltDel}>
          <Avatar src={ctrlAltDelIcon} /> Ctrl & Alt & Del
        </MenuItem>
      </Menu>
    </Box>
  )
}

function SendKeysMenuItemToggle({ label, icon, selected }: SendKeysMenuItemToggleProps) {
  return (
    <Stack direction="row" alignContent="center" alignItems="center" sx={{width: '100%'}}>
      <Avatar src={icon} />
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
