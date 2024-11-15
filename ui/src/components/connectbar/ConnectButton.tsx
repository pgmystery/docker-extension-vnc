import Button, { ButtonProps } from '@mui/material/Button'
import React from 'react'


export interface ConnectButtonProps extends ButtonProps {
  onConnect: ()=>void
  onDisconnect: ()=>void
  connected: boolean
}

export default function ConnectButton({ connected, onConnect, onDisconnect, ...buttonProps }: ConnectButtonProps) {
  return (
    connected
      ? <ConnectButtonConnected
          { ...buttonProps }
          color="error"
          onClick={onDisconnect}
        />
      : <ConnectButtonDisconnected
          { ...buttonProps }
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
