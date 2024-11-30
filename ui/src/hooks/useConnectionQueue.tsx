import { useEffect, useState } from 'react'
import { ConnectionData } from '../libs/vnc/VNC'


export type ConnectionQueueProps = ConnectionQueueConnect | ConnectionQueueDisconnect

interface ConnectionQueueConnect {
  type: 'connect'
  connectionData: ConnectionData
}

interface ConnectionQueueDisconnect {
  type: 'disconnect'
}

interface ConnectionQueueCallbacks {
  onConnect: (connectionData: ConnectionData)=>Promise<(() => Promise<void>) | undefined | void>
  onDisconnect: ()=>Promise<(() => Promise<void>) | undefined | void>
}


export default function useConnectionQueue(callbacks: ConnectionQueueCallbacks, initialState: ConnectionQueueProps | null = null) {
  const [connectionQueue, setConnectionQueue] = useState<ConnectionQueueProps | null>(initialState)

  useEffect(() => {
    if (connectionQueue === null) return

    switch (connectionQueue.type) {
      case 'connect':
        const { connectionData } = connectionQueue

        runCallback(callbacks.onConnect, connectionData)

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
    connect: (connectionData: ConnectionData) => setConnectionQueue({
      type: 'connect',
      connectionData,
    }),
    disconnect: () => setConnectionQueue({
      type: 'disconnect',
    })
  }
}
