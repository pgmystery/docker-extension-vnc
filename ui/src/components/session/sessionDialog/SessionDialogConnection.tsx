import { FormControl, FormLabel, MenuItem, Select, Stack } from '@mui/material'
import { ConnectionData, ConnectionType } from '../../../libs/vnc/VNC'
import React, { useEffect, useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import SessionConnectionDockerContainer, {
  ConnectionDataDockerContainer
} from './connections/SessionConnectionDockerContainer'
import SessionConnectionRemoteHost, { ConnectionDataRemoteHost } from './connections/SessionConnectionRemoteHost'


interface SessionDialogConnectionProps {
  connection?: ConnectionData
  setSubmitReady: (state: boolean)=>void
}


export default function SessionDialogConnection({ connection, setSubmitReady }: SessionDialogConnectionProps) {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const [connectionType, setConnectionType] = useState<ConnectionType>(connection?.type || 'container')

  useEffect(() => {
    if (!connection) return

    setConnectionType(connection.type)
  }, [connection])

  function getSelectionTypeComponent(type: ConnectionType) {
    switch (type) {
      case 'container':
        return <SessionConnectionDockerContainer
          ddClient={ddClient}
          connectionData={ connection?.type === 'container' ? connection.data as ConnectionDataDockerContainer : undefined}
          setSubmitReady={setSubmitReady}
        />
      case 'remote':
        return <SessionConnectionRemoteHost
          connectionData={ connection?.type === 'remote' ? connection.data as ConnectionDataRemoteHost : undefined}
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
          name="connection.type"
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
