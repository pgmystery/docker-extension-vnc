import VNCConnection from './VNCConnection'
import TargetDockerContainer from '../targets/TargetDockerContainer'
import ProxyNetwork from '../ProxyNetwork'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import ProxyDockerContainer from '../proxies/ProxyDockerContainer'
import { ContainerExtended } from '../../../types/docker/cli/inspect'


export type ConnectionTypeDockerContainer = 'container'
export interface ConnectionDataDockerContainer {
  type: ConnectionTypeDockerContainer
  data: ConnectionDataDockerContainerData
}
export interface ConnectionDataDockerContainerData {
  container: string
  port: number
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

    super(docker, config, proxy, target)

    this.network = new ProxyNetwork(docker, config)
    this.type = 'container'
  }

  async reconnect(container: ContainerExtended) {
    const proxyExist = await this.proxy.get(container)
    if (!proxyExist) return await this.disconnect()

    const targetContainerId = this.proxy.getTargetContainerId()
    const targetPort = this.proxy.getTargetPort()
    const sessionName = this.proxy.getSessionName()

    await this.connect(sessionName, {type: this.type, data: {container: targetContainerId, port: targetPort}})
  }

  async connect(sessionName: string, { data }: ConnectionDataDockerContainer) {
    await this.target.connect(data.container, data.port)
    const targetContainerId = this.target.getContainerId()

    if (!targetContainerId)
      throw new Error(`Can't get target container "${data.container}" ID`)

    return super.connect(sessionName, {
      type: this.type,
      data: {
        container: targetContainerId,
        port: data.port
      },
    })
  }

  async disconnect() {
    await super.disconnect()

    if (await this.network.exist())
      await this.network.remove({ force: true })
  }
}
