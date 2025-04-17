import { IconButton, Tooltip } from '@mui/material'
import DockerIcon from '../icons/DockerIcon'
import { useDialogs } from '@toolpad/core'
import { useContext, useMemo } from 'react'
import { VNCContext } from '../../contexts/VNCContext'
import DockerCommitDialog from '../dialogs/DockerCommitDialog'
import { getSessionStore } from '../../stores/sessionStore'
import { isRawExecResult } from '../../libs/docker/cli/Exec'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import DockerCreateImageDialog from '../dialogs/DockerCreateImageDialog'



interface DockerCreateImageButtonProps {
  disabled?: boolean
}


export default function DockerCreateImageButton({ disabled }: DockerCreateImageButtonProps) {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const vnc = useContext(VNCContext)
  const dialogs = useDialogs()
  const sessionStore = getSessionStore()

  async function handleClick() {
    if (!sessionStore)
      return

    const connectionData = vnc?.vnc.connection?.data
    if (!connectionData || !connectionData.container)
      return

    const runOptions: {
      containerRunOptions?: string
      containerRunArgs?: string
    } = {}

    if (vnc?.connectedData?.sessionName) {
      const currentSession = await sessionStore.getSessionByName(vnc?.connectedData?.sessionName)

      if (currentSession?.connection.type === 'image') {
        runOptions.containerRunOptions = currentSession.connection.data.containerRunOptions
        runOptions.containerRunArgs = currentSession.connection.data.containerRunArgs
      }
    }

    const createImageData = await dialogs.open(DockerCreateImageDialog, {
      port: vnc?.connectedData?.connection.data.port,
      runOptions,
      credentials: vnc?.connectedData?.credentials,
    })
    if (!createImageData)
      return

    const commitResult = await dialogs.open(DockerCommitDialog, {
      containerId: connectionData.container,
      repository: createImageData.repositoryFull,
      dockerClient: ddClient.docker
    })

    if (commitResult.state === 0) {
      try {
        if (createImageData.newSessionData) {
          await sessionStore.add(createImageData.newSessionData)
        }
      }
      catch (e: any) {
        console.error(e)

        if (e instanceof Object && e.hasOwnProperty('message'))
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)
        else {
          ddClient.desktopUI.toast.error(e)
        }
      }
    }
    else {
      const e = commitResult.out
      console.error(e)

      if (e instanceof Object && e.hasOwnProperty('message'))
        ddClient.desktopUI.toast.error(e.message)
      else if (isRawExecResult(e))
        ddClient.desktopUI.toast.error(e.stderr)
      else {
        ddClient.desktopUI.toast.error(e)
      }
    }
  }

  return (
    <Tooltip title="Create a Docker Image from the Container" arrow>
      <IconButton disabled={disabled} onClick={handleClick} >
        <DockerIcon fill="currentColor" />
      </IconButton>
    </Tooltip>
  )
}
