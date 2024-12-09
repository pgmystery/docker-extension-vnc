import { FormGroup, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { serializeConnectionData } from '../SessionDialog'


interface RemoteHostProps {
  connectionData?: ConnectionDataRemoteHost
  setSubmitReady: (state: boolean)=>void
}

export interface ConnectionDataRemoteHost {
  host: string
  port: number
}


export function serializeConnectionDataRemoteHost(formData: FormData): ConnectionDataRemoteHost {
  function setData(connectionData: Partial<ConnectionDataRemoteHost>, key: string, value: FormDataEntryValue) {
    switch (key) {
      case 'host':
        connectionData.host = value as string
        break
      case 'port':
        connectionData.port = Number(value as string)
        break
    }

    return connectionData
  }

  return serializeConnectionData(formData, setData)
}


export default function SessionConnectionRemoteHost ({ connectionData, setSubmitReady }: RemoteHostProps) {
  const [remoteHost, setRemoteHost] = useState<string>(connectionData?.host || '')
  const [remotePort, setRemotePort] = useState<number>(connectionData?.port || 5900)

  useEffect(() => {
    if (!connectionData) return

    setRemoteHost(connectionData.host)
    setRemotePort(connectionData.port)
  }, [connectionData])

  useEffect(() => {
    setSubmitReady(remoteHost !== '' && !!remotePort)
  }, [remoteHost, remotePort])

  return (
    <>
      <FormGroup>
        <Stack spacing={1}>
          <TextField
            name="connection.data.host"
            label="Remote Host IP/NAME"
            disabled={connectionData !== undefined}
            value={remoteHost}
            onChange={event => setRemoteHost(event.target.value)}
            autoFocus
            required
          />
          <TextField
            name="connection.data.port"
            label="Remote Host PORT"
            disabled={connectionData !== undefined}
            type="number"
            slotProps={{ htmlInput: { min: 1, max: 65535 } }}
            value={remotePort}
            onChange={event => setRemotePort(Number(event.target.value))}
            sx={{
              width: '200px',
            }}
            required
          />
        </Stack>
      </FormGroup>
    </>
  )
}
