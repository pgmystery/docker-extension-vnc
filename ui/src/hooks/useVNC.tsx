import { useMemo } from 'react'
import VNC from '../libs/vnc/VNC'
import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'


export default function useVNC(ddClient: DockerDesktopClient) {
  return useMemo(() => new VNC(ddClient.docker), [ddClient.docker])
}
