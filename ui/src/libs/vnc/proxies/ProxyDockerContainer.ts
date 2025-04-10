import Proxy from './Proxy'
import ProxyNetwork from '../ProxyNetwork'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config } from '../../../hooks/useConfig'
import DockerContainer from '../../docker/Container'
import TargetDockerContainer from '../targets/TargetDockerContainer'
import { ConnectionType } from '../VNC'
import MultiExecResult from '../../docker/MultiExecResult'
import { ContainerExtended } from '../../../types/docker/cli/inspect'
import { ConnectionDataDockerContainer } from '../connectionTypes/VNCDockerContainer/VNCDockerContainerBase'

export default class ProxyDockerContainer extends Proxy {
  private readonly proxyNetwork: ProxyNetwork

  constructor(proxyNetwork: ProxyNetwork, docker?: Docker, config?: Config) {
    super(docker, config)

    this.proxyNetwork = proxyNetwork
  }

  async get(container?: ContainerExtended) {
    const gotDockerContainer = await super.get(container)

    return gotDockerContainer && !!this.container
  }

  getTargetContainerId(): string {
    return this.getLabel(this.config.proxyContainerLabelContainerId)
  }

  async create(
    sessionName: string,
    connectionType: ConnectionType,
    target: TargetDockerContainer,
    data: ConnectionDataDockerContainer,
    labels?: Record<string, string>
  ): Promise<boolean> {
    if (!target.connected || !target.connection)
      return false

    await this.get()

    const { container: targetContainer, port } = data

    if (!await this.proxyNetwork.hasContainer(targetContainer)) {
      await target.connect(targetContainer, port)

      if (!await this.proxyNetwork.hasContainer(targetContainer))
        throw new Error(`The target container ${targetContainer} cannot connect to network ${this.proxyNetwork.name}`)
    }

    const targetHost = target.connection?.host

    if (this.container) {
      if (!await this.validateContainer(targetContainer, targetHost, port))
        await this.disconnect()
      else
        return true
    }

    return this._createContainer(
      sessionName,
      connectionType,
      target,
      targetContainer,
      labels,
    )
  }

  async disconnect() {
    const execResult = new MultiExecResult()

    const deleteExecResult = await this.delete({force: true})
    execResult.addExecResult(deleteExecResult)

    if (await this.proxyNetwork.exist()) {
      const networkRemoveExecResult = await this.proxyNetwork.remove({force: true})
      execResult.addExecResult(networkRemoveExecResult)
    }

    return execResult
  }

  private async validateContainer(containerId: string, targetHost?: string, targetPort?: number) {
    if (!this.container)
      return true

    const isInNetwork = await this.proxyNetwork.hasContainer(this.container.Id)
    if (!isInNetwork)
      return false

    const targetContainer = new DockerContainer(containerId, this.docker)
    const targetContainerExist = await targetContainer.get()
    if (!targetContainerExist || !targetContainer.container)
      throw new Error(`Target container with the id "${containerId}" don't exist`)

    const containerTargetIp = targetContainer.container.NetworkSettings.Networks[this.proxyNetwork.name].IPAddress

    return (
      this.getTargetContainerId() !== containerId
      || containerTargetIp !== targetHost
      || this.getTargetPort() !== targetPort
    )
  }

  private async _createContainer(
    sessionName: string,
    connectionType: ConnectionType,
    target: TargetDockerContainer,
    containerId: string,
    labels?: Record<string, string>
  ) {
    const {
      proxyContainerLabelContainerId,
    } = this.config
    const labelTargetContainerId = `${proxyContainerLabelContainerId}=${containerId}`

    const additionalLabels = []
    if (labels) {
      for (const [key, value] of Object.entries(labels)) {
        additionalLabels.push('--label', `${key}=${value}`)
      }
    }

    await this.createContainerFromTarget(sessionName, connectionType, target, [
      ...additionalLabels,
      '--label', labelTargetContainerId,
      '--network', this.config.network,
    ])

    return this.get()
  }
}
