import { BackdropContext } from './BackdropContext'
import React, { ReactNode, useCallback, useId, useState } from 'react'
import { BackdropComponentProps, CreateUseBackdropHook, UseBackdropComponent } from './useBackdrop'


interface BackdropProviderProps {
  children?: ReactNode
}


export default function BackdropProvider({ children }: BackdropProviderProps) {
  const [openWithProps, setOpenWithProps] = useState<BackdropComponentProps | null>(null)
  const keyPrefix = useId()

  const createBackdrop: CreateUseBackdropHook = useCallback((backdropProps: BackdropComponentProps = {}) => ({
    showBackdrop: function showBackdrop<T>(asyncCallback: ()=>Promise<T>) {
      setOpenWithProps(backdropProps)

      return asyncCallback().finally(() => setOpenWithProps(null))
    },
    isBackdropShowing: openWithProps !== null
  }), [keyPrefix, openWithProps])

  return (
    <BackdropContext.Provider value={createBackdrop}>
      { children }
      {
        openWithProps &&
        <UseBackdropComponent backdropProps={openWithProps ?? undefined} />
      }
    </BackdropContext.Provider>
  )
}
