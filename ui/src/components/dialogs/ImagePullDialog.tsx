import { Typography } from '@mui/material'
import { DialogProps } from '@toolpad/core'
import { useEffect, useMemo, useReducer, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { isRawExecResult } from '../../libs/docker/cli/Exec'
import DockerCli from '../../libs/docker/DockerCli'
import TextStreamDialog from './TextStreamDialog'


interface ImagePullDialogProps {
  image: string
  onSuccess?: ()=>void
  onError?: (error: any)=>void
}


export default function ImagePullDialog({ open, onClose, payload }: DialogProps<ImagePullDialogProps>) {
  const { image, onSuccess, onError } = payload
  const ddClient = useMemo(createDockerDesktopClient, [])
  const [stdout, dispatch] = useReducer(addStdout, [])
  const [finished, setFinished] = useState<boolean>(false)

  useEffect(() => {
    if (!open) return

    const dockerCli = new DockerCli(ddClient.docker)
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

  function addStdout(stdout: string[], data: string) {
    return [
      ...stdout,
      data,
    ]
  }

  return (
    <TextStreamDialog
      open={open}
      title={`Pull Docker Image "${image}" (Please Wait)`}
      finished={finished}
    >
      {stdout.map((stdout, index) =>
        <Typography sx={{display: 'block'}} component={'span'} key={index}>{ stdout }</Typography>
      )}
    </TextStreamDialog>
  )
}
