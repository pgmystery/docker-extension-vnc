import Proxy from '../proxies/Proxy'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import Target from '../targets/Target'
import { ConnectionData, ConnectionType } from '../VNC'
import { ContainerExtended } from '../../../types/docker/cli/inspect'


export default class VNCConnection {
  protected docker: Docker
  protected config: Config
  public type: ConnectionType | undefined
  public proxy: Proxy
  public target: Target

  constructor(docker?: Docker, config?: Config, proxy?: Proxy, target?: Target) {
    if (!proxy)
      proxy = new Proxy(docker, config)

    if (!target)
      target = new Target(docker, config)

    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    this.docker = docker
    this.config = config
    this.proxy = proxy
    this.target = target
  }

  async reconnect(container: ContainerExtended) {
    const proxyExist = await this.proxy.get(container)

    if (!proxyExist)
      return await this.disconnect()
  }

  connect(sessionName: string, connectionData: ConnectionData) {
    if (this.proxy.container) return true

    return this.proxy.create(sessionName, connectionData.type, this.target, connectionData.data)
  }

  async disconnect() {
    if (this.target.connected)
      await this.target.disconnect()

    if (this.proxy.exist())
      await this.proxy.delete()
  }

  get connected(): boolean {
    return this.proxy?.exist() || false
  }
}
