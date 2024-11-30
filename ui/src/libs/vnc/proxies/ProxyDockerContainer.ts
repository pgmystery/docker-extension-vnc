import Proxy from './Proxy'
import ProxyNetwork from '../ProxyNetwork'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config } from '../../../hooks/useConfig'
import DockerContainer from '../../docker/Container'
import TargetDockerContainer from '../targets/TargetDockerContainer'
import { ContainerInfo } from '../../../types/docker/extension'
import { ConnectionType } from '../VNC'
import { ConnectionDataDockerContainerData } from '../connectionTypes/VNCDockerContainer'
import MultiExecResult from '../../docker/MultiExecResult'

export default class ProxyDockerContainer extends Proxy {
  private readonly proxyNetwork: ProxyNetwork

  constructor(docker?: Docker, config?: Config) {
    super(docker, config)

    this.proxyNetwork = new ProxyNetwork(docker, config)
  }

  async get(container?: ContainerInfo) {
    const gotDockerContainer = await super.get(container)
    if (!gotDockerContainer || !this.container) return false

    const isInNetwork = await this.proxyNetwork.hasContainer(this.container.Id)
    if (!isInNetwork) {
      await this.delete()

      return false
    }

    return true
  }

  getTargetContainerId(): string {
    return this.getLabel(this.config.proxyContainerLabelContainerId)
  }

  async create(_: ConnectionType, target: TargetDockerContainer, data: ConnectionDataDockerContainerData) {
    if (!target.connected || !target.connection) return false
    await this.get()

    const { targetContainerId, targetPort } = data
    const targetIp = target.connection?.ip

    const isTargetInNetwork = await this.proxyNetwork.hasContainer(targetContainerId)
    if (!isTargetInNetwork)
      return false

    if (this.container) {
      const isInNetwork = await this.proxyNetwork.hasContainer(this.container.Id)
      if (!isInNetwork)
        await this.delete()

      const targetContainer = new DockerContainer({
        id: [targetContainerId]
      }, this.docker)
      const targetContainerExist = await targetContainer.get()
      if (!targetContainerExist || !targetContainer.container)
        throw new Error(`Target container with the id "${targetContainerId}" don't exist`)

      const containerTargetIp = targetContainer.container.NetworkSettings.Networks[this.proxyNetwork.name].IPAddress

      if (
        this.getTargetContainerId() !== targetContainerId
        || containerTargetIp !== targetIp
        || this.getTargetPort() !== targetPort
      ) {
        await this.delete()
      }
      else {
        return true
      }
    }

    const {
      proxyContainerLabelContainerId,
    } = this.config
    const labelTargetContainerId = `${proxyContainerLabelContainerId}=${targetContainerId}`

    await this.createContainerFromTarget('container', target, [
      '--label', labelTargetContainerId,
      '--network', this.config.network,
    ])

    return this.get()
  }

  async delete() {
    const execResult = new MultiExecResult()

    const deleteExecResult = await super.delete()
    execResult.addExecResult(deleteExecResult)

    const networkRemoveExecResult = await this.proxyNetwork.remove({force: true})
    execResult.addExecResult(networkRemoveExecResult)

    return execResult
  }
}
