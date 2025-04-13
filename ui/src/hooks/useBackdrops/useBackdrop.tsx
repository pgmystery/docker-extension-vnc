import React, { useContext, useEffect, useMemo, useState } from 'react'
import { BackdropContext } from './BackdropContext'
import { BackdropProps } from '@mui/material/Backdrop/Backdrop'
import { Backdrop, CircularProgress } from '@mui/material'
import * as crypto from 'node:crypto'


export type BackdropComponentBackdropProps = Omit<BackdropProps, 'open'>

export interface UseBackdropHook {
  open: ShowBackdrop
  isOpen: boolean
}

export type ShowBackdrop = <T>(asyncCallback: () => Promise<T>, currentBackdropProps?: BackdropComponentBackdropProps) => Promise<T>

interface Backdrop {
  id: string
  props: BackdropComponentBackdropProps
}


export default function useBackdrop(backdropProps: BackdropComponentBackdropProps = {}): UseBackdropHook {
  const id = useMemo(() => crypto.randomBytes(20).toString('hex'), [])
  const backdropHandlerDispatch = useContext(BackdropContext)

  if (backdropHandlerDispatch === null || backdropHandlerDispatch === undefined) {
    throw new Error('context "BackdropContext" was used without a Provider')
  }

  const [backdrops, setBackdrops] = useState<Backdrop[]>([])

  useEffect(() => {
    return () => {
      backdropHandlerDispatch({
        type: 'UNMOUNT',
        id,
      })
    }
  }, [])

  useEffect(() => {
    backdropHandlerDispatch({
      type: 'SET',
      id,
      backdrops: backdrops.map(backdrop => backdrop.props),
    })
  }, [backdrops])

  return useMemo(() => {
    return {
      open: function<T> (asyncCallback: ()=>Promise<T>, currentBackdropProps: BackdropComponentBackdropProps = {}) {
        const backdropId = crypto.randomBytes(20).toString('hex')
        const backdrop: Backdrop = {
          id: backdropId,
          props: {
            ...backdropProps,
            ...currentBackdropProps,
          }
        }

        setBackdrops([
          ...backdrops,
          backdrop,
        ])

        return asyncCallback().finally(() => setBackdrops(backdrops.filter(backdrop => backdrop.id !== id)))
      },
      isOpen: backdrops.length > 0
    }
  }, [backdrops])
}


export function UseBackdropComponent(props: BackdropComponentBackdropProps) {
  return (
    <Backdrop { ...props } open>
      <CircularProgress />
    </Backdrop>
  )
}
