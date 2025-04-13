import { DialogProps } from '@toolpad/core'
import TextStreamDialog from './TextStreamDialog'
import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import DockerCli from '../../libs/docker/DockerCli'
import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1/docker'


interface DockerCommitDialog {
  repository: string
  containerId: string
  dockerClient: DockerClient
}

interface DockerCommitDialogReturnSuccess {
  state: 0
  out: string
}

interface DockerCommitDialogReturnFailure {
  state: 1
  out: any
}

type DockerCommitDialogReturn = DockerCommitDialogReturnSuccess | DockerCommitDialogReturnFailure


export default function DockerCommitDialog({ open, onClose, payload }: DialogProps<DockerCommitDialog, DockerCommitDialogReturn>) {
  const { repository, containerId, dockerClient } = payload
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    async function commitImage() {
      const dockerCli = new DockerCli(dockerClient)

      try {
        const commitResult = await dockerCli.commit(containerId, repository)

        setResult(commitResult.stdout)
        onClose({
          state: 0,
          out: commitResult.stdout
        })
      }
      catch (e: any) {
        setResult('ERROR')

        onClose({
          state: 1,
          out: e
        })
      }
    }

    if (!open) return

    commitImage()
  }, [open])

  return (
    <TextStreamDialog
      open={open}
      title={`Create new Docker Image "${repository}" from Container with the ID "${containerId.substring(0, 12)}"`}
      finished={false}
    >
      <Typography sx={{display: 'block'}} component={'span'}>{ result }</Typography>
    </TextStreamDialog>
  )
}
