import { useEffect } from 'react'


interface UseWindowFocusProps {
  onFocus: (event: FocusEvent)=>void
  onBlur?: (event: FocusEvent)=>void
}

export default function useWindowFocus({ onFocus, onBlur }: UseWindowFocusProps) {
  useEffect(() => {
    window.addEventListener('focus', onFocus)

    if (onBlur) {
      window.addEventListener('blur', onBlur)
    }

    return () => {
      window.removeEventListener('focus', onFocus)

      if (onBlur) {
        window.removeEventListener('blur', onBlur)
      }
    }
  }, [])
}
