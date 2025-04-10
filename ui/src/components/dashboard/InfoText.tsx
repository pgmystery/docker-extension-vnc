import { Typography, TypographyProps } from '@mui/material'


export default function InfoText(props: TypographyProps) {
  return <Typography
    { ...props }
    sx={{
      ...props.sx,
      textAlign: 'left',
      marginLeft: '14px',
      marginRight: '14px',
    }}
  >{ props.children }</Typography>
}
