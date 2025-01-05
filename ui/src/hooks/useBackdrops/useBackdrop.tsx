import React, { useContext, useMemo } from 'react'
import { BackdropContext } from './BackdropContext'
import { BackdropProps } from '@mui/material/Backdrop/Backdrop'
import { Backdrop, CircularProgress } from '@mui/material'


export type BackdropComponentProps = Omit<BackdropProps, 'open'>
export type CreateUseBackdropHook = (backdropProps?: BackdropComponentProps)=>UseBackdropHook
export interface UseBackdropHook {
  showBackdrop: ShowBackdrop
  isBackdropShowing: boolean
}
export type ShowBackdrop = <T>(asyncCallback: () => Promise<T>) => Promise<T>


export default function useBackdrop(backdropProps?: BackdropComponentProps): UseBackdropHook {
  const backdropContext = useContext(BackdropContext)

  if (backdropContext === null || backdropContext === undefined) {
    throw new Error('context "BackdropContext" was used without a Provider')
  }

  return useMemo(() => backdropContext(backdropProps), [backdropProps])
}


export function UseBackdropComponent({ backdropProps }: { backdropProps?: BackdropComponentProps }) {
  return (
    <Backdrop { ...backdropProps } open={true}>
      <CircularProgress />
    </Backdrop>
  )
}
