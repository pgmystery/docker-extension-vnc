import { Skeleton } from '@mui/material'
import BackdropContainer from '../utils/BackdropContainer'


export default function VNCViewSkeleton() {
  return (
    <BackdropContainer open={true}>
      <Skeleton sx={{
        width: '100%',
        height: '100%',
      }} />
    </BackdropContainer>
  )
}
