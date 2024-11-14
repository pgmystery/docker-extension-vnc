import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { ProxyContainer } from './proxyContainer/ProxyContainer'
import DockerCli from './docker/DockerCli'
import { Container } from '../types/docker/extension'
import ProxyContainerNetwork from './proxyContainer/ProxyContainerNetwork'


export default class VNC {
  private readonly docker: Docker
  private readonly config: Config
  public proxyContainer: ProxyContainer | undefined

  constructor() {
    this.docker = createDockerDesktopClient().docker
    this.config = loadConfig()
  }

  async connect(targetContainerId: string, targetPort: number) {
    if (this.proxyContainer)
      await this.disconnect()

    this.proxyContainer = await this.createProxyContainer(
      targetContainerId,
      targetPort,
      this.docker,
      this.config,
    )

    await this.proxyContainer?.ready

    return this.proxyContainer
  }

  async reconnect() {
    this.proxyContainer = await this.getProxyContainer(this.docker, this.config)

    if (!this.proxyContainer) {
      return
    }

    await this.proxyContainer.ready

    return this.proxyContainer
  }

  async disconnect() {
    if (!this.proxyContainer) return

    await this.proxyContainer.remove()
    this.proxyContainer = undefined
  }

  async reset() {
    // TODO: AFTER PROMPT FOR USER TO HARD RESET
  }

  private async createProxyContainer(
    targetContainerId: string,
    targetPort: number,
    docker?: Docker,
    config?: Config,
  ): Promise<ProxyContainer | undefined> {
    // 1. Check if network exist:
    //    - true: throw error?
    //    - false: create docker network
    // 2. Run docker proxy image

    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    const proxyContainerNetwork = new ProxyContainerNetwork(docker, config)
    await proxyContainerNetwork.create()
    await proxyContainerNetwork.addTargetContainer(targetContainerId)
    const targetIp = await proxyContainerNetwork.getTargetIp()

    const {
      proxyContainerLabelKey,
      proxyContainerLabelContainerId,
      proxyContainerLabelTargetIp,
      proxyContainerLabelTargetPort
    } = config

    const labelIdentify = `${proxyContainerLabelKey}=""`
    const labelTargetContainerId = `${proxyContainerLabelContainerId}=${targetContainerId}`
    const labelTargetIp = `${proxyContainerLabelTargetIp}=${targetIp}`
    const labelTargetPort = `${proxyContainerLabelTargetPort}=${targetPort}`

    const execResult = await docker.cli.exec('run', [
      '--detach',
      '--label', labelIdentify,
      '--label', labelTargetContainerId,
      '--label', labelTargetIp,
      '--label', labelTargetPort,
      '--network', config.network,
      '-p', `"${config.proxyContainerLocalPort.toString()}"`,
      '-e', `"NONVC_REMOTE_SERVER=${targetIp}:${targetPort}"`,
      config.proxyDockerImage
    ])

    if (execResult.stderr)
      throw new Error(execResult.stderr)

    return this.getProxyContainer(docker, config)
  }

  private async getProxyContainer(docker?: Docker, config?: Config): Promise<ProxyContainer | undefined> {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    const proxyContainerNetwork = new ProxyContainerNetwork(docker, config)
    if (!await proxyContainerNetwork.exist()) return

    const proxyContainerList = await docker.listContainers({
      filters: {
        network: [config.network],
        label: [
          config.proxyContainerLabelKey,
          config.proxyContainerLabelContainerId,
          config.proxyContainerLabelTargetIp,
          config.proxyContainerLabelTargetPort,
        ],
      }
    }) as Container[]

    if (proxyContainerList.length > 1)
      throw new Error('Found multiple proxy instances...')
    else if (proxyContainerList.length == 0) return

    const container = proxyContainerList[0]
    const dockerCli = new DockerCli(docker)
    const containerExtended = await dockerCli.inspect(container.Id)

    return new ProxyContainer(containerExtended, proxyContainerNetwork, docker, config)
  }
}
