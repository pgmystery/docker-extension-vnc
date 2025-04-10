import { CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { Children, ReactNode, useEffect, useRef } from 'react'

interface TextStreamDialogProps {
  open: boolean
  title: string
  finished: boolean
  children: ReactNode
}

export default function TextStreamDialog({ open, title, finished, children }: TextStreamDialogProps) {
  const dialogContentElementRef = useRef<HTMLElement>(null)
  const descriptionElementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!dialogContentElementRef || Children.count(children) === 0) return

    dialogContentElementRef.current?.scrollTo(0, dialogContentElementRef.current?.scrollHeight)
  }, [children])

  return (
    <Dialog open={ open } scroll="paper">
      <DialogTitle>{ title }</DialogTitle>
      <DialogContent dividers ref={dialogContentElementRef}>
        <DialogContentText ref={descriptionElementRef} tabIndex={-1} sx={{margin: '10px'}}>
          { children }
          {!finished && <CircularProgress size="30px" sx={{marginTop: '10px'}} />}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}
