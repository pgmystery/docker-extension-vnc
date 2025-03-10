import { BackdropContext } from './BackdropContext'
import React, { ReactNode, useMemo } from 'react'
import { UseBackdropComponent } from './useBackdrop'
import useBackdropHandler from './useBackdropHandler'


interface BackdropProviderProps {
  children?: ReactNode
}

export default function BackdropProvider({ children }: BackdropProviderProps) {
  const [backdropHandlerData, backdropHandlerDispatch] = useBackdropHandler()

  const backdropComponents = useMemo(() => {
    const components = []

    for (const [id, backdrops] of Object.entries(backdropHandlerData)) {
      components.push(backdrops.map((backdropProps, index) => {
        return <UseBackdropComponent
          {...backdropProps}
          key={`${id}-${index}`}
        />
      }))
    }

    return components
  }, [backdropHandlerData])

  return (
    <BackdropContext.Provider value={backdropHandlerDispatch}>
      { children }
      {
        ...backdropComponents
      }
    </BackdropContext.Provider>
  )
}
