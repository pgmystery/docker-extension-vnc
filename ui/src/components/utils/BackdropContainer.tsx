import { Backdrop, BackdropProps, Box, CircularProgress } from '@mui/material'


export default function BackdropContainer(props: BackdropProps) {
  return (
    <Box sx={{
      ...props.sx,
      position: "absolute",
      zIndex: 0,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    }}>
      { props.children }
      <Backdrop { ...props } sx={{
        position: 'absolute',
      }} >
        <CircularProgress color="inherit"/>
      </Backdrop>
    </Box>
  )
}
