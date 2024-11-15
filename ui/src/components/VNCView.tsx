import React, { useRef } from 'react'
import { VncScreen } from 'react-vnc'
import { Box } from '@mui/material'


// https://stackoverflow.com/a/9490267


interface VNCViewProps {
  url: string
}

export default function VNCView({ url }: VNCViewProps) {
  const vncScreenRef = useRef<React.ElementRef<typeof VncScreen>>(null)

  return (
    <Box sx={{
      display: 'flex',
      height: '100%',
    }}>
      <VncScreen
        url={url}
        scaleViewport
        clipViewport
        style={{
          width: '100%',
          height: '100%',
        }}
        debug
        ref={vncScreenRef}
        rfbOptions={{
          credentials: {
            password: 'password',
          },
        }}
      />
    </Box>
  )
}
