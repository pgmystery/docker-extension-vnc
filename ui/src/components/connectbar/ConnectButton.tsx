import Button, { ButtonProps } from '@mui/material/Button'
import React from 'react'


export interface ConnectButtonProps extends ButtonProps {
  onConnect: ()=>void
  onDisconnect: ()=>void
  connected: boolean
}

export default function ConnectButton(props: ConnectButtonProps) {
  const { connected } = props

  return (
    connected
      ? <ConnectButtonConnected
          { ...props }
          color="error"
          onClick={props.onDisconnect}
        />
      : <ConnectButtonDisconnected
          { ...props }
          onClick={props.onConnect}
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
