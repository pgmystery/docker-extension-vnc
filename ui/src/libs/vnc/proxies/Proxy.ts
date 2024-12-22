import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import DockerContainer from '../../docker/Container'
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

  constructor(docker?: Docker, config?: Config) {
    docker = docker || createDockerDesktopClient().docker
    config = config || loadConfig()

    super(config.proxyContainerName, docker)

    this.config = config
  }

  getSessionName(): string {
    return this.getLabel(this.config.proxyContainerLabelSessionName)
  }

  getConnectionType(): ConnectionType {
    return this.getLabel(this.config.proxyContainerLabelConnectionType) as ConnectionType
  }

  getTargetIp() {
    return this.getLabel(this.config.proxyContainerLabelTargetIp)
  }

  getTargetPort(): number {
    return Number(this.getLabel(this.config.proxyContainerLabelTargetPort))
  }

  get port(): number | undefined {
    if (!this.exist())
      return

    const internalPort = this.container?.NetworkSettings.Ports[`${this.config.proxyContainerLocalPort}/tcp`]

    if (!internalPort || internalPort.length === 0)
      return

    return Number(internalPort[0].HostPort)
  }

  get url(): ProxyURL {
    const port = this.port

    if (!port)
      throw new Error('Can\'t get the proxy container external port')

    return {
      ws: `ws://localhost:${port}/websockify`,
      browser: `http://localhost:${port}/vnc.html`
    }
  }

  async get(container?: ContainerExtended) {
    if (!container) {
      const gotDockerContainer = await super.get()
      if (!gotDockerContainer || !this.container) return false
    }
    else {
      this.container = container
    }

    if (this.container.State.Status !== 'running') {
      try {
        await this.start()
      }
      catch {}
    }

    return true
  }

  async update() {
    const gotDockerContainer = await super.get()

    return gotDockerContainer && !!this.container
  }

  async create(sessionName: string, connectionType: ConnectionType, target: Target, _?: unknown) {
    if (!target.connected || !target.connection) return false
    await this.get()

    await this.createContainerFromTarget(sessionName, connectionType, target)

    return this.get()
  }

  protected async createContainerFromTarget(sessionName: string, connectionType: ConnectionType, target: Target, args: string[] = []) {
    if (!target.connected || !target.connection) return

    const targetIp = target.connection.ip
    const targetPort = target.connection.port
    const {
      proxyContainerLabelKey,
      proxyContainerName,
      proxyContainerLabelTargetIp,
      proxyContainerLabelTargetPort,
      proxyContainerLabelConnectionType,
      proxyContainerLabelSessionName,
    } = this.config

    const labelIdentify = `${proxyContainerLabelKey}=""`
    const labelSessionName = `${proxyContainerLabelSessionName}="${sessionName}"`
    const labelTargetIp = `${proxyContainerLabelTargetIp}=${targetIp}`
    const labelTargetPort = `${proxyContainerLabelTargetPort}=${targetPort}`
    const labelConnectionType = `${proxyContainerLabelConnectionType}=${connectionType}`

    const createExecResult = await this.createContainer(this.config.proxyDockerImage, [
      ...args,
      '--detach',
      '--name', proxyContainerName,
      '--label', labelSessionName,
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
    const gotDockerContainer = await this.update()
    if (!gotDockerContainer || !this.exist()) return new MultiExecResult()

    const execResult = await super.delete({force: true})
    if (execResult.stderr)
      throw new Error(execResult.stderr)

    const gotContainer = await this.get()

    if (gotContainer)
      throw new ContainerDeleteError('Can\' delete the proxy container')

    return execResult
  }

  protected getLabel(labelKey: string) {
    this.withContainer()

    const labelValue = this.container?.Config.Labels[labelKey]

    if (!labelValue)
      throw new Error(
        `The proxy-container "${this.container?.Id}" has no label with the key "${labelKey}"`
      )

    return labelValue
  }
}
