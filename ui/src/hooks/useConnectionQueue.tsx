import { useEffect, useState } from 'react'


export type ConnectionQueueProps = ConnectionQueueConnect | ConnectionQueueDisconnect | ConnectionQueueReconnect

interface ConnectionQueueConnect {
  type: 'connect'
  containerId: string
  targetPort: number
}

interface ConnectionQueueReconnect {
  type: 'reconnect'
}

interface ConnectionQueueDisconnect {
  type: 'disconnect'
}

interface ConnectionQueueCallbacks {
  onConnect: (containerId: string, targetPort: number)=>Promise<(() => Promise<void>) | undefined | void>
  onDisconnect: ()=>Promise<(() => Promise<void>) | undefined | void>
  onReconnect: ()=>Promise<(() => Promise<void>) | undefined | void>
}


export default function useConnectionQueue(callbacks: ConnectionQueueCallbacks, initialState: ConnectionQueueProps | null = null) {
  const [connectionQueue, setConnectionQueue] = useState<ConnectionQueueProps | null>(initialState)

  useEffect(() => {
    if (connectionQueue === null) return

    switch (connectionQueue.type) {
      case 'reconnect':
        runCallback(callbacks.onReconnect)

        break
      case 'connect':
        const { containerId, targetPort } = connectionQueue

        runCallback(callbacks.onConnect, containerId, targetPort)

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
    reconnect: () => setConnectionQueue({
      type: 'reconnect',
    }),
    connect: (containerId: string, targetPort: number) => setConnectionQueue({
      type: 'connect',
      containerId,
      targetPort,
    }),
    disconnect: () => setConnectionQueue({
      type: 'disconnect',
    })
  }
}
