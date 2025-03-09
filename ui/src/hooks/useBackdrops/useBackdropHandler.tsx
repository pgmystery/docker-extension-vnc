import { useReducer } from 'react'
import { BackdropComponentBackdropProps } from './useBackdrop'


interface BackdropHandlerActionSet {
  type: 'SET'
  id: string
  backdrops: BackdropComponentBackdropProps[]
}

interface BackdropHandlerActionUnmount {
  type: 'UNMOUNT'
  id: string
}

export type BackdropHandlerAction = BackdropHandlerActionSet | BackdropHandlerActionUnmount

interface BackdropHandler {
  [key: string]: BackdropComponentBackdropProps[]
}


function backdropHandlerReducer(backdrops: BackdropHandler, action: BackdropHandlerAction) {
  switch (action.type) {
    case 'SET':
      return {
        ...backdrops,
        [action.id]: action.backdrops,
      }

    case 'UNMOUNT':
      const newBackdrops = {...backdrops}
      delete newBackdrops[action.id]

      return newBackdrops
  }
}


export default function useBackdropHandler() {
  return useReducer(backdropHandlerReducer, {})
}
