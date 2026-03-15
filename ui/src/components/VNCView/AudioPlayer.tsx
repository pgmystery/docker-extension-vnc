import React from 'react'

interface AudioPlayerProps {
  audioRef:  React.MutableRefObject<HTMLAudioElement | null>
}

export default function AudioPlayer({ audioRef }: AudioPlayerProps) {
  return (
    <audio
      ref={audioRef}
      autoPlay
      style={{ display: 'none' }} // Hidden because it's a VNC background stream
      // style={{ display: 'block', width: '300px', position: 'fixed', bottom: '20px', left: '20px', }} // Make it visible for testing
      muted={false}
      controls
    />
  )
}
