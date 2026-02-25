import { CircularProgress, TypographyProps } from '@mui/material'
import InfoRow from './InfoRow'
import React from 'react'


interface InfoTextImageSizeProps extends TypographyProps {
  imageSize?: string
}


export default function InfoTextImageSize(props: InfoTextImageSizeProps) {
  const { imageSize } = props

  return <InfoRow k="Image size" v={
    imageSize === undefined
    ? <CircularProgress size={20} sx={{
      display: 'inline-block',
      maxWidth: '50px',
      width: '50px',
      verticalAlign: 'middle',
    }} />
    : imageSize
  } />
}
