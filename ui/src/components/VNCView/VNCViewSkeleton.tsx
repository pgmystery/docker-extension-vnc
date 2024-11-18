import { Skeleton } from '@mui/material'
import BackdropContainer from '../utils/BackdropContainer'


export default function VNCViewSkeleton() {
  return (
    <BackdropContainer sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
    }} open={true}>
      <Skeleton sx={{
        width: '100%',
        height: '100%',
      }} />
    </BackdropContainer>
  )
}
