import { FormControl, FormLabel, MenuItem, Select, Stack } from '@mui/material'
import { ConnectionType } from '../../../libs/vnc/VNC'
import React, { useEffect, useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import SessionConnectionRemoteHost from './connections/SessionConnectionRemoteHost'
import SessionConnectionDockerImage from './connections/SessionConnectionDockerImage'
import { SessionConnectionData } from '../../../types/session'
import SessionConnectionDockerContainer from './connections/SessionConnectionDockerContainer'
import {
  ConnectionDataDockerContainer
} from '../../../libs/vnc/connectionTypes/VNCDockerContainer/VNCDockerContainerBase'
import { ConnectionDataDockerImage } from '../../../libs/vnc/connectionTypes/VNCDockerImage'
import { ConnectionDataRemoteHost } from '../../../libs/vnc/connectionTypes/VNCRemoteHost'


interface SessionDialogConnectionProps {
  connection?: SessionConnectionData
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
      case 'image':
        return <SessionConnectionDockerImage
          connectionData={ connection?.type === 'image' ? connection.data as ConnectionDataDockerImage : undefined}
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
          <MenuItem value="image">Docker Image</MenuItem>
          <MenuItem value="remote">Remote Host</MenuItem>
        </Select>
        {
          getSelectionTypeComponent(connectionType)
        }
      </Stack>
    </FormControl>
  )
}
