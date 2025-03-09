import { CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import { DialogProps } from '@toolpad/core'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { isRawExecResult } from '../../libs/docker/cli/Exec'
import DockerCli from '../../libs/docker/DockerCli'


interface ImagePullDialogProps {
  image: string
  onSuccess?: ()=>void
  onError?: (error: any)=>void
}


export default function ImagePullDialog({ open, onClose, payload }: DialogProps<ImagePullDialogProps>) {
  const { image, onSuccess, onError } = payload
  const ddClient = useMemo(createDockerDesktopClient, [])
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

    const dockerCli = new DockerCli()
    dockerCli.pull(image, dispatch)
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
      <DialogTitle>Pull Docker Image "${image}" (Please Wait)</DialogTitle>
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
