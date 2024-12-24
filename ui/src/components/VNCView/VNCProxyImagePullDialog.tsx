import { CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { isRawExecResult } from '../../libs/docker/cli/Exec'
import useVNC from '../../hooks/useVNC'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { DialogProps } from '@toolpad/core'


interface VNCProxyImagePullDialogProps {
  onSuccess?: ()=>void,
  onError?: (error: any)=>void,
}


export default function VNCProxyImagePullDialog({open, onClose, payload}: DialogProps<VNCProxyImagePullDialogProps>) {
  const { onSuccess, onError } = payload
  const ddClient = useMemo(createDockerDesktopClient, [])
  const vnc = useVNC(ddClient)
  const [stdout, dispatch] = useReducer(addStdout, [])
  const dialogContentElementRef = useRef<HTMLElement>(null)
  const descriptionElementRef = useRef<HTMLElement>(null)
  const [finished, setFinished] = useState<boolean>(false)

  useEffect(() => {
    if (!open) return

    const { current: descriptionElement } = descriptionElementRef

    if (descriptionElement !== null) {
      descriptionElement.focus()
    }

    vnc.pullProxyDockerImage(dispatch)
       .then(() => {
         setFinished(true)

         if (onSuccess)
           onSuccess()
       })
       .catch(e => {
         console.error(e)

         if (e instanceof Error)
           ddClient.desktopUI.toast.error(e.message)
         else if (isRawExecResult(e))
           ddClient.desktopUI.toast.error(e.stderr)
         else {
           ddClient.desktopUI.toast.error(e)
         }

         if (onError)
           onError(e)
       })
       .finally(onClose)
  }, [open])

  useEffect(() => {
    if (!dialogContentElementRef || stdout.length === 0) return

    dialogContentElementRef.current?.scrollTo(0, dialogContentElementRef.current?.scrollHeight)
  }, [stdout])

  function addStdout(stdout: string[], data: string) {
    return [
      ...stdout,
      data,
    ]
  }

  return (
    <Dialog open={ open } scroll="paper">
      <DialogTitle>Pull VNC-Proxy docker image (Please Wait)</DialogTitle>
      <DialogContent dividers ref={dialogContentElementRef}>
        <DialogContentText ref={descriptionElementRef} tabIndex={-1} sx={{margin: '10px'}}>
          {stdout.map((stdout, index) =>
            <Typography sx={{display: 'block'}} component={'span'} key={index}>{ stdout }</Typography>
          )}
          {!finished && <CircularProgress size="30px" sx={{marginTop: '10px'}} />}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}
