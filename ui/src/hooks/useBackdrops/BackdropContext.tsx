import { createContext } from 'react'
import { CreateUseBackdropHook } from './useBackdrop'


export const BackdropContext = createContext<CreateUseBackdropHook | null>(null)
