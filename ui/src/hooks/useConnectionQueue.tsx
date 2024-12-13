import { useEffect, useState } from 'react'
import { Session } from '../types/session'


export type ConnectionQueueProps = ConnectionQueueConnect | ConnectionQueueDisconnect

interface ConnectionQueueConnect {
  type: 'connect'
  session: Session
}

interface ConnectionQueueDisconnect {
  type: 'disconnect'
}

interface ConnectionQueueCallbacks {
  onConnect: (session: Session)=>Promise<(() => Promise<void>) | undefined | void>
  onDisconnect: ()=>Promise<(() => Promise<void>) | undefined | void>
}


export default function useConnectionQueue(callbacks: ConnectionQueueCallbacks, initialState: ConnectionQueueProps | null = null) {
  const [connectionQueue, setConnectionQueue] = useState<ConnectionQueueProps | null>(initialState)

  useEffect(() => {
    if (connectionQueue === null) return

    switch (connectionQueue.type) {
      case 'connect':
        const { session } = connectionQueue

        runCallback(callbacks.onConnect, session)

        break
      case 'disconnect':
        runCallback(callbacks.onDisconnect)

        break
    }
  }, [connectionQueue])

  function runCallback(callback: (...args: any[])=>Promise<(() => Promise<void>) | undefined | void>, ...args: any[]) {
    callback(...args)
      .then((afterCallback) => {
        setConnectionQueue(null)

        if (afterCallback) afterCallback()
      })
  }

  return {
    connect: (session: Session) => setConnectionQueue({
      type: 'connect',
      session,
    }),
    disconnect: () => setConnectionQueue({
      type: 'disconnect',
    })
  }
}
