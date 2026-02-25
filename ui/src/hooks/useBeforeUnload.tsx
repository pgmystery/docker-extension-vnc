import { useRef } from 'react'


export default function useBeforeUnload(activeMessage?: string) {
  function handleBeforeUnload(e: BeforeUnloadEvent) {
    e.preventDefault()

    return callbackRef.current.message
  }

  const callbackRef = useRef({
    callback: handleBeforeUnload,
    message: activeMessage,
  })

  const activate = (message: string) => {
    callbackRef.current.message = message

    window.addEventListener('beforeunload', handleBeforeUnload)
  }
  const deactivate = () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }

  return ([
    activate,
    deactivate,
  ])
}
