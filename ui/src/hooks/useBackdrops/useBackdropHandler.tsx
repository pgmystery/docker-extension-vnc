import { useReducer } from 'react'
import { BackdropComponentBackdropProps } from './useBackdrop'

export enum BackdropHandlerActionType {
  SET,
  UNMOUNT,
}

interface BackdropHandlerActionSet {
  type: BackdropHandlerActionType.SET
  id: string
  backdrops: BackdropComponentBackdropProps[]
}

interface BackdropHandlerActionUnmount {
  type: BackdropHandlerActionType.UNMOUNT
  id: string
}

export type BackdropHandlerAction = BackdropHandlerActionSet | BackdropHandlerActionUnmount

interface BackdropHandler {
  [key: string]: BackdropComponentBackdropProps[]
}


function backdropHandlerReducer(backdrops: BackdropHandler, action: BackdropHandlerAction) {
  switch (action.type) {
    case BackdropHandlerActionType.SET:
      return {
        ...backdrops,
        [action.id]: action.backdrops,
      }

    case BackdropHandlerActionType.UNMOUNT:
      const newBackdrops = {...backdrops}
      delete newBackdrops[action.id]

      return newBackdrops
  }
}


export default function useBackdropHandler() {
  return useReducer(backdropHandlerReducer, {})
}
