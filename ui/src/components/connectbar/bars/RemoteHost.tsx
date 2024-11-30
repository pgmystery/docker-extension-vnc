import { Stack, TextField } from '@mui/material'
import React, { useState } from 'react'
import ConnectButton from '../ConnectButton'
import { ConnectionData } from '../../../libs/vnc/VNC'
import VNCRemoteHost from '../../../libs/vnc/connectionTypes/VNCRemoteHost'


interface RemoteHostProps {
  connection?: VNCRemoteHost
  onConnect: (connectionData: ConnectionData)=>void
  onDisconnect: ()=>void
  disabled?: boolean
}


export default function RemoteHost ({ disabled, onConnect, onDisconnect, connection }: RemoteHostProps) {
  const [remoteHost, setRemoteHost] = useState<string>(connection?.target.connection?.ip || '')
  const [remotePort, setRemotePort] = useState<number>(connection?.target.connection?.port || 5900)

  function handleConnectClicked() {
    onConnect({
      type: 'remote',
      data: {
        host: remoteHost,
        port: remotePort,
      }
    })
  }

  function handleDisconnectClicked() {
    onDisconnect()
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextField
          label="Remote Host IP/NAME"
          disabled={disabled || connection !== undefined}
          value={remoteHost}
          onChange={event => setRemoteHost(event.target.value)}
          autoFocus
        />
        <TextField
          label="Remote Host PORT"
          disabled={disabled || connection !== undefined}
          type="number"
          slotProps={{ htmlInput: { min: 1, max: 65535 } }}
          value={remotePort}
          onChange={event => setRemotePort(Number(event.target.value))}
        />
        <ConnectButton
          onConnect={handleConnectClicked}
          onDisconnect={handleDisconnectClicked}
          connected={connection !== undefined}
          connectButtonDisabled={remoteHost === '' || !remotePort || disabled}
          disconnectButtonDisabled={disabled}
          sx={{
            minWidth: '180px',
          }}
        />
      </Stack>
    </>
  )
}
