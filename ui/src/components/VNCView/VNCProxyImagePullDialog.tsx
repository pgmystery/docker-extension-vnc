import { CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import { useEffect, useReducer, useRef, useState } from 'react'
import Proxy from '../../libs/vnc/Proxy'
import { Toast } from '@docker/extension-api-client-types/dist/v1'
import { isRawExecResult } from '../../libs/docker/cli/Exec'


interface VNCProxyImagePullDialogProps {
  open: boolean,
  onDone: (successful: boolean) => void,
  proxy?: Proxy,
  ddUIToast?: Toast
}


export default function VNCProxyImagePullDialog({open, onDone, proxy, ddUIToast}: VNCProxyImagePullDialogProps) {
  const [stdout, dispatch] = useReducer(addStdout, [])
  const dialogContentElementRef = useRef<HTMLElement>(null)
  const descriptionElementRef = useRef<HTMLElement>(null)
  const [finished, setFinished] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef

      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    async function pullProxyImage() {
      if (!proxy) return

      try {
        const onFinish = (exitCode: number) => {
          setFinished(true)
          onDone(exitCode === 0)
        }

        await proxy.pullDockerImage(dispatch, onFinish)
      }
      catch (e: any) {
        console.error(e)

        if (ddUIToast) {
          if (e instanceof Error)
            ddUIToast.error(e.message)
          else if (isRawExecResult(e))
            ddUIToast.error(e.stderr)
        }

        onDone(false)
      }
    }

    pullProxyImage()
  }, [open, proxy])

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
