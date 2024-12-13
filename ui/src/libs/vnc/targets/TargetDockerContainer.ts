import Target from './Target'
import DockerContainer from '../../docker/Container'
import ProxyNetwork from '../ProxyNetwork'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { Docker } from '@docker/extension-api-client-types/dist/v1'


export default class TargetDockerContainer extends Target {
  private readonly proxyNetwork: ProxyNetwork
  private dockerContainer: DockerContainer | undefined

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    super(docker, config)

    this.proxyNetwork = new ProxyNetwork(this.docker, this.config)
  }

  async connect(container: string, port: number) {
    if (this.dockerContainer?.exist())
      await this.disconnect()

    this.dockerContainer = new DockerContainer(container, this.docker)
    const containerExist = await this.dockerContainer.get()

    if (!containerExist || !this.dockerContainer?.exist())
      throw new Error(`Can't find the target container "${container}"`)

    if (this.dockerContainer.container?.State.Status !== 'running')
      throw new Error(`Can't connect the container "${container}", because the container is not running`)

    await this.proxyNetwork.addContainer(container)
    await this.dockerContainer.get()
    const ip = this.dockerContainer.container.NetworkSettings.Networks[this.proxyNetwork.name].IPAddress

    if (!ip)
      throw new Error(
        `An Error appear while getting the target container "${container}" network ip in the network with the name ${this.proxyNetwork.name}`
      )

    return super.connect(ip, port)
  }

  async disconnect() {
    await super.disconnect()
    if (!this.dockerContainer) return

    await this.dockerContainer.get()
    if (!this.dockerContainer.container) return

    await this.proxyNetwork.removeContainer(this.dockerContainer.container.Id)

    this.dockerContainer = undefined
  }

  get container() {
    return this.dockerContainer?.container
  }

  getContainerName() {
    if (!this.dockerContainer?.exist()) return

    return this.dockerContainer.container?.Name
  }

  getContainerId() {
    if (!this.dockerContainer?.exist()) return

    return this.dockerContainer.container?.Id
  }

  get connected() {
    return this.dockerContainer?.exist() || false
  }
}
