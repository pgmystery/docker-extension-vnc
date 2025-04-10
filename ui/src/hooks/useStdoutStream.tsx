import { useReducer } from 'react'

type DispatchTypes = DispatchTypeAdd | DispatchTypeClear

interface DispatchTypeAdd {
  type: 'add'
  data: string
}

interface DispatchTypeClear {
  type: 'clear'
}

export default function useStdoutStream() {
  const [stdout, dispatch] = useReducer(onDispatch, [])

  function onDispatch(stdout: string[], payload: DispatchTypes) {
    switch (payload.type) {
      case 'add':
        return [
          ...stdout,
          payload.data,
        ]

      case 'clear':
        return []
    }
  }

  return {
    stdout,
    addStdout: (data: string) => dispatch({
      type: 'add',
      data,
    }),
    clearStdout: () => dispatch({
      type: 'clear',
    }),
  }
}
