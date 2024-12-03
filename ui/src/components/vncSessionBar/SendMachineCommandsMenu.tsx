import { Avatar, Divider, IconButton, ListSubheader, Menu, MenuItem, Tooltip } from '@mui/material'
import { MouseEvent, useState } from 'react'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import LockResetIcon from '@mui/icons-material/LockReset'


interface SendMachineCommandsMenuProps {
  sendMachineCommand: (command: MachineCommand)=>void
}
export type MachineCommand = 'reboot' | 'reset' | 'shutdown'


export default function SendMachineCommandsMenu({ sendMachineCommand }: SendMachineCommandsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function handleCommandButtonClick(command: MachineCommand) {
    handleClose()

    sendMachineCommand(command)
  }

  return (
    <>
      <Tooltip title="Send Machine commands">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'machine-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <PowerSettingsNewIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="machine-menu"
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
        <ListSubheader>Machine Commands</ListSubheader>

        <MenuItem onClick={() => handleCommandButtonClick('reboot')}>
          <Avatar>
            <RestartAltIcon />
          </Avatar> Reboot
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleCommandButtonClick('shutdown')}>
          <Avatar>
            <PowerSettingsNewIcon />
          </Avatar> Shutdown
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleCommandButtonClick('reset')}>
          <Avatar>
            <LockResetIcon />
          </Avatar> Reset
        </MenuItem>
      </Menu>
    </>
  )
}
