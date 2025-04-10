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
      if (!gotDockerContainer || !this.container)
        return false
    }
    else {
      this.container = container
    }

    if (!this.isRunning) {
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

  async create(sessionName: string, connectionType: ConnectionType, target: Target, _?: unknown, labels?: {[key: string]: string}) {
    if (!target.connected || !target.connection)
      return false

    await this.get()

    const additionalLabels = []
    if (labels) {
      for (const [key, value] of Object.entries(labels)) {
        additionalLabels.push('--label', `${key}=${value}`)
      }
    }

    await this.createContainerFromTarget(sessionName, connectionType, target, additionalLabels)

    return this.get()
  }

  protected async createContainerFromTarget(sessionName: string, connectionType: ConnectionType, target: Target, args: string[] = []) {
    if (!target.connected || !target.connection)
      return

    const { host: targetHost, port: targetPort } = target.connection
    const {
      proxyContainerLabelKey,
      proxyContainerName,
      proxyContainerLabelTargetIp,
      proxyContainerLabelTargetPort,
      proxyContainerLabelConnectionType,
      proxyContainerLabelSessionName,
      proxyContainerLocalPort,
    } = this.config

    const createExecResult = await this.createContainer(this.config.proxyDockerImage, [
      ...args,
      '--detach',
      '--name', `"${proxyContainerName}"`,
      '--label', `${proxyContainerLabelSessionName}="${sessionName}"`,
      '--label', `${proxyContainerLabelKey}=""`,
      '--label', `${proxyContainerLabelTargetIp}=${targetHost}`,
      '--label', `${proxyContainerLabelTargetPort}=${targetPort}`,
      '--label', `${proxyContainerLabelConnectionType}=${connectionType}`,
      '-p', `"${proxyContainerLocalPort.toString()}"`,
      '-e', `"NOVNC_REMOTE_SERVER=${targetHost}:${targetPort}"`,
      '-e', `"NONVC_REMOTE_SERVER=${targetHost}:${targetPort}"`,  // TO HAVE SUPPORT OF A "BROKEN" OLD VERSION OF THE PROXY DOCKER IMAGE
    ])

    if (createExecResult.stderr)
      throw new Error(createExecResult.stderr)
  }

  async disconnect() {
    const gotDockerContainer = await this.update()
    if (!gotDockerContainer || !this.exist())
      return new MultiExecResult()

    const execResult = await this.delete({force: true})
    if (execResult.stderr)
      throw new Error(execResult.stderr)

    const containerStillExists = await this.get()

    if (containerStillExists)
      throw new ContainerDeleteError('Can\' delete the proxy container')

    return execResult
  }

  get isRunning(): boolean {
    return this.container?.State.Status === 'running'
  }
}
