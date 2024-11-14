import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import ProxyContainerNetwork from './ProxyContainerNetwork'
import { Container } from '../../types/docker/extension'

export class ProxyContainer {
  private readonly docker: Docker
  private readonly config: Config
  private readonly network: ProxyContainerNetwork
  public readonly info: ContainerExtended
  public ready: Promise<void>

  constructor(container: ContainerExtended, network: ProxyContainerNetwork, docker?: Docker, config?: Config) {
    docker
      ? this.docker = docker
      : this.docker = createDockerDesktopClient().docker

    config
      ? this.config = config
      : this.config = loadConfig()

    // INFO: "this.info" needs to be before "this.network"
    this.info = container
    this.network = network
    this.ready = new Promise((resolve, reject) => {
      if (this.network.proxyContainerId) resolve()

      this.network.addProxyContainer(this.info.Id)
        .then((execResult) => {
          if (execResult.stderr)
            reject(execResult.stderr)

          resolve()
        })
        .catch(e => reject(e))
    })
  }

  getTargetContainerId(): string {
    const targetContainerId = this.info.Config.Labels[this.config.proxyContainerLabelContainerId]

    if (!targetContainerId)
      throw new Error(
        `The proxy-container "${this.info.Id}" has no label with the key "${this.config.proxyContainerLabelContainerId}"`
      )

    return targetContainerId
  }

  async getTargetContainerName(): Promise<string> {
    const targetContainerId = this.getTargetContainerId()

    const targetContainerList = await this.docker.listContainers({
      filters: {
        id: [targetContainerId],
      }
    }) as Container[]

    if (targetContainerList.length !== 1)
      throw new Error('Can\t find the target container')

    return targetContainerList[0].Names[0]
  }

  getTargetIp(): string {
    const targetIp = this.info.Config.Labels[this.config.proxyContainerLabelTargetIp]

    if (!targetIp)
      throw new Error(
        `The proxy-container "${this.info.Id}" has no label with the key "${this.config.proxyContainerLabelTargetIp}"`
      )

    return targetIp
  }

  getTargetPort(): string {
    const targetPort = this.info.Config.Labels[this.config.proxyContainerLabelTargetPort]

    if (!targetPort)
      throw new Error(
        `The proxy-container "${this.info.Id}" has no label with the key "${this.config.proxyContainerLabelTargetPort}"`
      )

    return targetPort
  }

  get port(): number {
    return Number(this.info.NetworkSettings.Ports[`${this.config.proxyContainerLocalPort}/tcp`][0].HostPort)
  }

  get url(): string {
    return `ws://localhost:${this.port}/websockify`
  }

  async remove() {
    // 1. Remove target container from proxy network
    // 2. Delete proxy container
    // 3. Delete proxy network

    await this.network.clear()

    const removeExecResult = await this.docker.cli.exec('rm', ['-f', this.info.Id])
    if (removeExecResult.stderr)
      throw new Error(removeExecResult.stderr)

    await this.network.remove()
  }
}
