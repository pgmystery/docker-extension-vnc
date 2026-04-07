import { Stack } from '@mui/material';
import FullscreenButton from './items/FullscreenButton'
import { RefObject } from 'react';

interface SelkiesSessionBarProps {
  containerRef: RefObject<HTMLDivElement>
}

export default function SelkiesSessionBar({containerRef}: SelkiesSessionBarProps) {
  return (
    <Stack direction="row" spacing={ 1 }>
      <FullscreenButton element={ containerRef }/>
    </Stack>
  )
}
