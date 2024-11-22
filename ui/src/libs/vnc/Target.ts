import DockerContainer from '../docker/Container'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Config, loadConfig } from '../../hooks/useConfig'
import ProxyNetwork from './ProxyNetwork'


export default class Target {
  private readonly docker: Docker
  private readonly config: Config
  private readonly proxyNetwork: ProxyNetwork
  private dockerContainer: DockerContainer | undefined
  public proxyNetworkIp: string | undefined

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    this.docker = docker
    this.config = config
    this.proxyNetwork = new ProxyNetwork(docker, config)
  }

  async setNewTargetContainer(containerId: string) {
    if (this.dockerContainer?.exist())
      await this.disconnectFromProxyNetwork()

    const filters = {
      id: [containerId]
    }

    this.dockerContainer = new DockerContainer(filters, this.docker)
    const containerExist = await this.dockerContainer.get()

    if (!containerExist || !this.dockerContainer?.exist())
      throw new Error(`Can't find the target container with the id "${containerId}"`)

    await this.proxyNetwork.addContainer(containerId)
    await this.dockerContainer.get()
    this.proxyNetworkIp = this.dockerContainer.container?.NetworkSettings.Networks[this.proxyNetwork.name].IPAddress
  }

  getContainerName() {
    if (!this.dockerContainer?.exist()) return

    return this.dockerContainer.container?.Names[0]
  }

  async disconnectFromProxyNetwork() {
    if (!this.dockerContainer) return

    await this.dockerContainer.get()
    if (!this.dockerContainer.container) return

    const isInNetwork = await this.proxyNetwork.hasContainer(this.dockerContainer.container?.Id)
    if (isInNetwork) {
      await this.proxyNetwork.removeContainer(this.config.network)
    }

    this.dockerContainer = undefined
    this.proxyNetworkIp = undefined
  }

  get container() {
    return this.dockerContainer?.container
  }

  exist() {
    return this.dockerContainer?.exist() || false
  }
}
