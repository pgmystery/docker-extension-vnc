import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { ContainerInfo, DockerListContainersFilters } from '../../../types/docker/extension'
import DockerContainer, { MultipleContainersFoundError } from '../../docker/Container'
import { ContainerExtended } from '../../../types/docker/cli/inspect'
import MultiExecResult from '../../docker/MultiExecResult'
import { ConnectionType } from '../VNC'
import Target from '../targets/Target'

export interface ProxyURL {
  ws: string
  browser: string
}

export class ContainerDeleteError extends Error {}

export default class Proxy extends DockerContainer {
  protected readonly config: Config
  public containerExtended: ContainerExtended | undefined

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    const proxyContainerFilter: DockerListContainersFilters = {
      label: [
        config.proxyContainerLabelKey,
      ],
    }
    super(proxyContainerFilter, docker)

    this.config = config
  }

  getConnectionType(): ConnectionType {
    return this.getLabel(this.config.proxyContainerLabelConnectionType) as ConnectionType
  }

  getTargetPort(): number {
    return Number(this.getLabel(this.config.proxyContainerLabelTargetPort))
  }

  get port(): number {
    this.withContainer()

    return Number(this.containerExtended?.NetworkSettings.Ports[`${this.config.proxyContainerLocalPort}/tcp`][0].HostPort)
  }

  get url(): ProxyURL {
    return {
      ws: `ws://localhost:${this.port}/websockify`,
      browser: `http://localhost:${this.port}/vnc.html`
    }
  }

  async get(container?: ContainerInfo) {
    if (!container) {
      const gotDockerContainer = await super.get()
      if (!gotDockerContainer || !this.container) return false
    }
    else {
      this.container = container
    }

    if (this.container.State !== 'running') {
      await this.delete()

      return false
    }

    this.containerExtended = await this.inspect()

    return true
  }

  async update() {
    const gotDockerContainer = await super.get()
    if (!gotDockerContainer || !this.container) return false

    this.containerExtended = await this.inspect()

    return true
  }

  async create(connectionType: ConnectionType, target: Target, _?: unknown) {
    if (!target.connected || !target.connection) return false
    await this.get()

    await this.createContainerFromTarget(connectionType, target)

    return this.get()
  }

  protected async createContainerFromTarget(connectionType: ConnectionType, target: Target, args: string[] = []) {
    if (!target.connected || !target.connection) return

    const targetIp = target.connection.ip
    const targetPort = target.connection.port
    const {
      proxyContainerLabelKey,
      proxyContainerLabelTargetIp,
      proxyContainerLabelTargetPort,
      proxyContainerLabelConnectionType,
    } = this.config

    const labelIdentify = `${proxyContainerLabelKey}=""`
    const labelTargetIp = `${proxyContainerLabelTargetIp}=${targetIp}`
    const labelTargetPort = `${proxyContainerLabelTargetPort}=${targetPort}`
    const labelConnectionType = `${proxyContainerLabelConnectionType}=${connectionType}`

    const createExecResult = await this.createContainer(this.config.proxyDockerImage, [
      ...args,
      '--detach',
      '--label', labelIdentify,
      '--label', labelTargetIp,
      '--label', labelTargetPort,
      '--label', labelConnectionType,
      '-p', `"${this.config.proxyContainerLocalPort.toString()}"`,
      '-e', `"NONVC_REMOTE_SERVER=${targetIp}:${targetPort}"`,
    ])
    if (createExecResult.stderr) throw new Error(createExecResult.stderr)
  }

  async delete() {
    await this.update()
    if (!this.exist()) return new MultiExecResult()

    const execResult = await super.delete({force: true})
    if (execResult.stderr)
      throw new Error(execResult.stderr)

    try {
      const gotContainer = await this.get()

      if (gotContainer) throw new ContainerDeleteError('Can\' delete the proxy container')
    }
    catch (e) {
      if (e instanceof MultipleContainersFoundError) {
        const multiExecResult = new MultiExecResult(execResult)

        const proxyContainers = await this.docker.listContainers({
          all: true,
          filters: this.filters
        }) as ContainerInfo[]

        const deleteProxyContainersExecResult = await this.docker.cli.exec('rm', [
          '--force',
          ...proxyContainers.map(container => container.Id)
        ])
        if (deleteProxyContainersExecResult.stderr)
          throw new ContainerDeleteError(deleteProxyContainersExecResult.stderr)

        multiExecResult.addExecResult(deleteProxyContainersExecResult)

        return multiExecResult
      }

      throw e
    }

    return execResult
  }

  protected getLabel(labelKey: string) {
    this.withContainer()

    const labelValue = this.containerExtended?.Config.Labels[labelKey]

    if (!labelValue)
      throw new Error(
        `The proxy-container "${this.container?.Id}" has no label with the key "${labelKey}"`
      )

    return labelValue
  }
}
