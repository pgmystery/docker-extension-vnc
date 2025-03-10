import { createContext, Dispatch } from 'react'
import { BackdropHandlerAction } from './useBackdropHandler'


export const BackdropContext = createContext<Dispatch<BackdropHandlerAction> | null>(null)
