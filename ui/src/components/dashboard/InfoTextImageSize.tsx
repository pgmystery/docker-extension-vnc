import InfoText from './InfoText'
import { CircularProgress, Typography, TypographyProps } from '@mui/material'


interface InfoTextImageSizeProps extends TypographyProps {
  imageSize?: string
}


export default function InfoTextImageSize(props: InfoTextImageSizeProps) {
  const { imageSize } = props

  return <InfoText>Image sizes = {
    imageSize === undefined
    ? <CircularProgress size={20} sx={{
      display: 'inline-block',
      maxWidth: '50px',
      width: '50px',
      verticalAlign: 'middle',
    }} />
    : <Typography {...props} component="span" sx={{display: 'inline-block', textDecoration: 'underline'}}>{ imageSize }</Typography>
  }</InfoText>
}
