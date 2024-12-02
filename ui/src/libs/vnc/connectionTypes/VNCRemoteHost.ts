import VNCConnection from './VNCConnection'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { ContainerExtended } from '../../../types/docker/cli/inspect'


export type ConnectionTypeRemoteHost = 'remote'
export interface ConnectionDataRemoteHost {
  type: ConnectionTypeRemoteHost
  data: ConnectionDataRemoteHostData
}
export interface ConnectionDataRemoteHostData {
  host: string
  port: number
}

export default class VNCRemoteHost extends VNCConnection {
  public type: ConnectionTypeRemoteHost

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    super(docker, config)

    this.type = 'remote'
  }

  async reconnect(container: ContainerExtended) {
    await super.reconnect(container)

    const targetIp = this.proxy.getTargetIp()
    const targetPort = this.proxy.getTargetPort()

    await this.connect({type: this.type, data: {host: targetIp, port: targetPort}})
  }

  async connect({ data }: ConnectionDataRemoteHost) {
    const { host, port } = data
    await this.target.connect(host, port)

    return super.connect({type: this.type, data})
  }
}
