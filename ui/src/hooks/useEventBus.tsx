import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import { useEffect } from 'react'
import eventBus from '../libs/EventBus'
import { isRawExecResult } from '../libs/docker/cli/Exec'
import useImagePullDialog from './useImagePullDialog'


export default function useEventBus(ddClient: DockerDesktopClient) {
  const pullDockerImage = useImagePullDialog()

  useEffect(() => {
    eventBus.on('pullImage', (image: string) => pullDockerImage(image))
  }, [])

  useEffect(() => {
    eventBus.on('showError', (e: any) => {
      console.error(e)

      if (ddClient.desktopUI.toast) {
        if (e instanceof Object && e.hasOwnProperty('message'))
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)
        else {
          ddClient.desktopUI.toast.error(e)
        }
      }
    })

    eventBus.on('openUrl', (url: string)=> ddClient.host.openExternal(url))
  }, [])
}
