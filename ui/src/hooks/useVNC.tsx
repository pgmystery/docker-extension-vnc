import { useEffect, useState } from 'react'
import VNC from '../libs/vnc/VNC'
import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import { isRawExecResult } from '../libs/docker/cli/Exec'


export default function useVNC(ddClient: DockerDesktopClient) {
  const [vnc, setVNC] = useState<VNC>()

  useEffect(() => {
    const vnc = new VNC(ddClient.docker)
    vnc.ready.then(() => setVNC(vnc)).catch(e => {
      if (e instanceof Error)
        return ddClient.desktopUI.toast.error(e.message)
      else if (isRawExecResult(e))
        return ddClient.desktopUI.toast.error(e.stderr)
    })
  }, [])

  return vnc
}
