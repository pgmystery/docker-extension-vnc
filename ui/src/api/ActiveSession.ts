import BackendRoute from './BackendRoute'
import { HttpService } from '@docker/extension-api-client-types/dist/v1'
import { createDockerDesktopClient } from '@docker/extension-api-client'


interface ActiveSessionData {
  name: string
  proxy_container_id: string
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

  async get(): Promise<ActiveSessionData | undefined> {
    try {
      return await this.api.get('') as ActiveSessionData
    }
    catch {}
  }

  set(data: ActiveSessionData) {
    return this.api.post<void>('', data)
  }

  reset() {
    return this.api.delete<void>('')
  }
}
