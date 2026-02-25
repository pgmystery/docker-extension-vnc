import { Alert } from '@mui/lab'
import { AlertTitle, IconButton, Tooltip, Typography } from '@mui/material'
import eventBus from '../../../libs/EventBus'
import InfoIcon from '@mui/icons-material/Info'
import { useMemo } from 'react'
import getOS from '../../../utils/getOS'


interface KvmAlertProps {
  show?: boolean
}


export default function KvmAlert({ show = false }: KvmAlertProps) {
  const os = useMemo(() => getOS(), [])

  if (!show)
    return

  return (
    <Alert severity="warning" sx={{
      '.MuiAlert-message': {
        paddingTop: 0,
      },
    }}>
      <AlertTitle>
        <Typography sx={{display: 'inline'}}>Warning: KVM Required!</Typography>
        <Tooltip title="How to enable KVM on your system" arrow>
          <IconButton
            size="small"
            onClick={() => eventBus.emit(
              'openUrl',
              os === 'windows'
              ? 'https://www.paralint.com/2022/11/find-new-modified-and-unversioned-subversion-files-on-windows'
              : 'https://docs.docker.com/desktop/setup/install/linux/#kvm-virtualization-support',
            )}
            sx={{
              marginLeft: 'auto',
            }}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </AlertTitle>
      This image requires KVM acceleration for optimal performance.
    </Alert>
  )
}
