import { createContext } from 'react'
import { VNCHandler } from '../hooks/useVNC'


export const VNCContext = createContext<VNCHandler | null>(null)
