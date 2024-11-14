import Network from '../docker/Network'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Container } from '../../types/docker/extension'


export default class ProxyContainerNetwork extends Network {
  private config: Config
  public proxyContainerId: string | undefined
  public targetContainerId: string | undefined

  constructor(docker?: Docker, config?: Config) {
    docker = docker || createDockerDesktopClient().docker
    config = config || loadConfig()

    super(docker, config.network)

    this.config = config
  }

  create() {
    return super.create([
      "--attachable",
    ])
  }

  async exist() {
    const networkExist = await super.exist()

    if (!networkExist) return false
    if (this.targetContainerId && this.proxyContainerId) return true

    const proxyNetworkContainers = await this.docker.listContainers({
      filters: {
        network: [this.name],
      },
    }) as Container[]

    const proxyContainer = proxyNetworkContainers.find(
      container => container.Labels.hasOwnProperty(this.config.proxyContainerLabelKey)
    )
    if (!proxyContainer) {
      // TODO: PROXY CONTAINER NOT FOUND IN AN EXISTING PROXY-CONTAINER-NETWORK...
      throw new Error()
    }

    const targetContainer = proxyNetworkContainers.find(
      container =>
        container.NetworkSettings.Networks[this.name].IPAddress === proxyContainer.Labels[this.config.proxyContainerLabelTargetIp]
    )
    if (!targetContainer) {
      // TODO: TARGET CONTAINER NOT FOUND IN AN EXISTING PROXY-CONTAINER-NETWORK...
      throw new Error()
    }

    this.targetContainerId = targetContainer.Id
    this.proxyContainerId = proxyContainer.Id

    return true
  }

  async getTargetIp(): Promise<string> {
    const targetContainers = await this.docker.listContainers({
      filters: {
        id: [this.targetContainerId],
        network: [this.name],
      }
    }) as Container[]

    if (targetContainers.length !== 1)
      throw new Error('Can\'t find target container in network')

    const targetContainer = targetContainers[0]

    return targetContainer.NetworkSettings.Networks[this.name].IPAddress
  }

  async clear() {
    if (this.targetContainerId) {
      const execResult = await this.removeContainer(this.targetContainerId)

      if (execResult.stderr)
        throw new Error(execResult.stderr)

      this.targetContainerId = undefined
    }

    if (this.proxyContainerId) {
      const execResult = await this.removeContainer(this.proxyContainerId)

      if (execResult.stderr)
        throw new Error(execResult.stderr)

      this.proxyContainerId = undefined
    }
  }

  async addProxyContainer(proxyContainerId: string) {
    if (this.proxyContainerId)
      throw new Error('The proxy container is already in the network')

    const execResult = await this.addContainer(proxyContainerId)
    if (execResult.stderr)
      throw new Error(execResult.stderr)

    this.proxyContainerId = proxyContainerId

    return execResult
  }

  async addTargetContainer(targetContainerId: string) {
    if (this.targetContainerId)
      throw new Error('The target container is already in the network')

    const execResult = await this.addContainer(targetContainerId)
    if (execResult.stderr)
      throw new Error(execResult.stderr)

    this.targetContainerId = targetContainerId

    return execResult
  }
}
