import VNCConnection from './VNCConnection'
import TargetDockerContainer from '../targets/TargetDockerContainer'
import ProxyNetwork from '../ProxyNetwork'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import ProxyDockerContainer from '../proxies/ProxyDockerContainer'
import { ContainerInfo } from '../../../types/docker/extension'
import { ConnectionType } from '../VNC'


export type ConnectionTypeDockerContainer = 'container'
export interface ConnectionDataDockerContainer {
  type: ConnectionTypeDockerContainer
  data: ConnectionDataDockerContainerData
}
export interface ConnectionDataDockerContainerData {
  targetContainerId: string
  targetPort: number
}


export default class VNCDockerContainer extends VNCConnection {
  declare proxy: ProxyDockerContainer
  declare target: TargetDockerContainer
  public type: ConnectionTypeDockerContainer
  public network: ProxyNetwork

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    const proxy = new ProxyDockerContainer(docker, config)
    const target = new TargetDockerContainer(docker, config)

    super(proxy, target, docker, config)

    this.network = new ProxyNetwork(docker, config)
    this.type = 'container'
  }

  async reconnect(container: ContainerInfo) {
    const proxyExist = await this.proxy.get(container)
    if (!proxyExist) return await this.disconnect()

    let targetContainerId: string, targetPort: number

    try {
      targetContainerId = this.proxy.getTargetContainerId()
      targetPort = this.proxy.getTargetPort()

      await this.connect(this.type, {targetContainerId, targetPort})
    }
    catch (e) {
      await this.disconnect()

      throw e
    }
  }

  async connect(_: ConnectionType, data: ConnectionDataDockerContainerData) {
    await this.target.connect(data.targetContainerId, data.targetPort)

    return super.connect(this.type, data)
  }

  async disconnect() {
    await super.disconnect()

    if (await this.network.exist())
      await this.network.remove({ force: true })
  }
}
