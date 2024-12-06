import { FormControl, FormLabel, MenuItem, Select, Stack } from '@mui/material'
import { ConnectionType, VNCConnectionType } from '../../../libs/vnc/VNC'
import React, { useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import SessionConnectionDockerContainer, {
  ConnectionDataDockerContainer
} from './connections/SessionConnectionDockerContainer'
import SessionConnectionRemoteHost, { ConnectionDataRemoteHost } from './connections/SessionConnectionRemoteHost'


interface SessionDialogConnectionProps {
  connection?: VNCConnectionType
  setSubmitReady: (state: boolean)=>void
}

export type ConnectionData = ConnectionDataRemoteHost | ConnectionDataDockerContainer


export default function SessionDialogConnection({ connection, setSubmitReady }: SessionDialogConnectionProps) {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const [connectionType, setConnectionType] = useState<ConnectionType>(connection?.type || 'container')

  function getSelectionTypeComponent(type: ConnectionType) {
    switch (type) {
      case 'container':
        return <SessionConnectionDockerContainer
          ddClient={ddClient}
          connection={connection?.type === 'container' ? connection : undefined}
          setSubmitReady={setSubmitReady}
        />
      case 'remote':
        return <SessionConnectionRemoteHost
          connection={connection?.type === 'remote' ? connection : undefined}
          setSubmitReady={setSubmitReady}
        />
      default:
        return <div>ERROR</div>
    }
  }

  return (
    <FormControl fullWidth>
      <Stack spacing={1}>
        <FormLabel required>Connection-Type</FormLabel>
        <Select
          name="connectionType"
          value={connectionType}
          onChange={e => setConnectionType(e.target.value as ConnectionType)}
          sx={{
            width: '170px',
          }}
        >
          <MenuItem value="container">Docker Container</MenuItem>
          <MenuItem value="remote">Remote Host</MenuItem>
        </Select>
        {
          getSelectionTypeComponent(connectionType)
        }
      </Stack>
    </FormControl>
  )
}
