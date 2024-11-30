import {
  FormControl,
  InputLabel, MenuItem,
  Select,
  Stack,
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import DockerContainer from './bars/DockerContainer'
import { ConnectionData, ConnectionType, VNCConnectionType } from '../../libs/vnc/VNC'
import RemoteHost from './bars/RemoteHost'


export interface ConnectBarProps {
  connection?: VNCConnectionType
  onConnect: (connectionData: ConnectionData)=>void
  onDisconnect: ()=>void
  disabled?: boolean
}


export default function ConnectBar({ disabled, onConnect, onDisconnect, connection }: ConnectBarProps) {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const [connectionType, setConnectionType] = useState<ConnectionType>(connection?.type || 'container')

  useEffect(() => {
    if (connection) setConnectionType(connection.type)
  }, [connection])

  function getSelectionTypeComponent(type: ConnectionType) {
    switch (type) {
      case 'container':
        return <DockerContainer
          ddClient={ddClient}
          connection={connection?.type === 'container' ? connection : undefined}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          disabled={disabled}
        />
      case 'remote':
        return <RemoteHost
          connection={connection?.type === 'remote' ? connection : undefined}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          disabled={disabled}
        />
      default:
        return <div>ERROR</div>
    }
  }

  return (
    <FormControl fullWidth>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          flexFlow: 'wrap',
        }}
      >
        <FormControl>
          <InputLabel>Connection-Type</InputLabel>
          <Select
            label="Connection-Type"
            value={connectionType}
            onChange={e => setConnectionType(e.target.value as ConnectionType)}
            disabled={disabled || connection !== undefined}
            sx={{
              width: '170px',
            }}
          >
            <MenuItem value="container">Docker Container</MenuItem>
            <MenuItem value="remote">Remote Host</MenuItem>
          </Select>
        </FormControl>
        {
          getSelectionTypeComponent(connectionType)
        }
      </Stack>
    </FormControl>
  )
}
