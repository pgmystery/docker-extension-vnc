import Button, { ButtonProps } from '@mui/material/Button'
import React from 'react'


export interface ConnectButtonProps extends ButtonProps {
  onConnect: ()=>void
  onDisconnect: ()=>void
  connected: boolean
  connectButtonDisabled?: boolean
  disconnectButtonDisabled?: boolean
}

export default function ConnectButton({
  connected,
  onConnect,
  onDisconnect,
  connectButtonDisabled,
  disconnectButtonDisabled,
  ...buttonProps
}: ConnectButtonProps) {
  return (
    connected
      ? <ConnectButtonConnected
          { ...buttonProps }
          disabled={disconnectButtonDisabled}
          color="error"
          onClick={onDisconnect}
        />
      : <ConnectButtonDisconnected
          { ...buttonProps }
          disabled={connectButtonDisabled}
          onClick={onConnect}
        />
  )
}

function ConnectButtonDisconnected(props: ButtonProps) {
  return (
    <Button { ...props } >Connect</Button>
  )
}

function ConnectButtonConnected(props: ButtonProps) {
  return (
    <Button { ...props } >Disconnect</Button>
  )
}
