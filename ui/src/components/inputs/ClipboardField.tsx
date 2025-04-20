import { styled, TextareaAutosize, TextField } from '@mui/material'
import { useEffect, useRef } from 'react'

interface ClipboardFieldProps {
  value: string
  setValue: (value: string)=>void
  isPassword?: boolean
  autoFocus?: boolean
}

export default function ClipboardField({ isPassword, autoFocus, value, setValue }: ClipboardFieldProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    const textAreaElement = textAreaRef.current
    if (!textAreaElement) return

    const updateTopPosition = () => {
      const top = textAreaElement.getBoundingClientRect().top

      document.documentElement.style.setProperty('--textarea-top', `${top}px`)
    }

    updateTopPosition()

    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateTopPosition()
      })
    }

    resizeObserverRef.current.observe(textAreaElement)

    return () => {
      if (resizeObserverRef.current && textAreaElement) {
        resizeObserverRef.current.unobserve(textAreaElement)
      }
    }
  }, [])

  if (isPassword) {
    return (
      <TextField
        autoFocus={autoFocus}
        type="password"
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        sx={{
          width: '300px',
        }}
      />
    )
  }
  else {
    return (
      <Textarea
        ref={textAreaRef}
        autoFocus={autoFocus}
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        placeholder="Edit clipboard content in here..."
      />
    )
  }
}

const Textarea = styled(TextareaAutosize)(() => `
  min-height: 50px;
  min-width: 300px;
  overflow: auto !important;
  max-height: calc(100vh - var(--textarea-top, 0));
`)
