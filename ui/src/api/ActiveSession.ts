import BackendRoute from './BackendRoute'
import { HttpService } from '@docker/extension-api-client-types/dist/v1'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { ConnectionType } from '../libs/vnc/VNC'
import { ConnectionDataRemoteHost } from '../libs/vnc/connectionTypes/VNCRemoteHost'
import { ConnectionDataDockerContainer } from '../libs/vnc/connectionTypes/VNCDockerContainer/VNCDockerContainerBase'
import { ConnectionDataDockerImageWithOptions } from '../libs/vnc/connectionTypes/VNCDockerImage'


interface ActiveSessionData<T extends ConnectionType> {
  name: string
  proxy_container_id: string
  connection: {
    type: T,
    data: ActiveSessionConnectionData[T]
  }
}

interface ActiveSessionConnectionData {
  remote: ConnectionDataRemoteHost
  container: ConnectionDataDockerContainer
  image: ConnectionDataDockerImageWithOptions
}


export default class ActiveSessionBackend {
  private api: BackendRoute

  constructor(backendHttpService?: HttpService) {
    if (!backendHttpService) {
      const ddClient = createDockerDesktopClient()
      backendHttpService = ddClient.extension.vm?.service
      if (!backendHttpService)
        throw new Error('No Docker Desktop Client found...')
    }

    this.api = new BackendRoute(backendHttpService, '/session/active')
  }

  async get(): Promise<ActiveSessionData<ConnectionType> | undefined> {
    try {
      return await this.api.get('') as ActiveSessionData<ConnectionType>
    }
    catch {}
  }

  set<T extends ConnectionType>(data: ActiveSessionData<T>) {
    return this.api.post<void>('', data)
  }

  reset() {
    return this.api.delete<void>('')
  }
}
