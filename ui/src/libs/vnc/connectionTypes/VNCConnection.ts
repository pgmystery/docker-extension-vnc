import Proxy from '../proxies/Proxy'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import Target from '../targets/Target'
import { ContainerInfo } from '../../../types/docker/extension'
import { ConnectionType } from '../VNC'


export default class VNCConnection {
  protected docker: Docker
  protected config: Config
  public type: ConnectionType | undefined
  public proxy: Proxy
  public target: Target

  constructor(proxy: Proxy, target: Target, docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    this.docker = docker
    this.config = config
    this.proxy = proxy
    this.target = target
  }

  async reconnect(_: ContainerInfo) {}

  connect(connectionType: ConnectionType, _?: unknown) {
    return this.proxy.create(connectionType, this.target, _)
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
