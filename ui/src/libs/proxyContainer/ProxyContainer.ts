import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import ProxyContainerNetwork from './ProxyContainerNetwork'

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
    const targetContainerId = this.info.Labels[this.config.proxyContainerLabelContainerId]

    if (!targetContainerId)
      throw new Error(
        `The proxy-container "${this.info.Id}" has no label with the key "${this.config.proxyContainerLabelContainerId}"`
      )

    return targetContainerId
  }

  getTargetIp(): string {
    const targetIp = this.info.Labels[this.config.proxyContainerLabelTargetIp]

    if (!targetIp)
      throw new Error(
        `The proxy-container "${this.info.Id}" has no label with the key "${this.config.proxyContainerLabelTargetIp}"`
      )

    return targetIp
  }

  getTargetPort(): string {
    const targetPort = this.info.Labels[this.config.proxyContainerLabelTargetPort]

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

    const removeExecResult = await this.docker.cli.exec('rm', [this.info.Id])
    if (removeExecResult.stderr)
      throw new Error(removeExecResult.stderr)

    await this.network.remove()
  }
}
