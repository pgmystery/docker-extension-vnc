import Proxy from './Proxy'
import ProxyNetwork from '../ProxyNetwork'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config } from '../../../hooks/useConfig'
import DockerContainer from '../../docker/Container'
import TargetDockerContainer from '../targets/TargetDockerContainer'
import { ConnectionType } from '../VNC'
import { ConnectionDataDockerContainerData } from '../connectionTypes/VNCDockerContainer'
import MultiExecResult from '../../docker/MultiExecResult'
import { ContainerExtended } from '../../../types/docker/cli/inspect'

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

  async create(sessionName: string, _: ConnectionType, target: TargetDockerContainer, data: ConnectionDataDockerContainerData) {
    if (!target.connected || !target.connection) return false
    await this.get()

    const { container, port } = data
    const targetIp = target.connection?.ip

    const isTargetInNetwork = await this.proxyNetwork.hasContainer(container)
    if (!isTargetInNetwork)
      return false

    if (this.container) {
      const isInNetwork = await this.proxyNetwork.hasContainer(this.container.Id)
      if (!isInNetwork)
        await this.delete()

      const targetContainer = new DockerContainer(container, this.docker)
      const targetContainerExist = await targetContainer.get()
      if (!targetContainerExist || !targetContainer.container)
        throw new Error(`Target container with the id "${container}" don't exist`)

      const containerTargetIp = targetContainer.container.NetworkSettings.Networks[this.proxyNetwork.name].IPAddress

      if (
        this.getTargetContainerId() !== container
        || containerTargetIp !== targetIp
        || this.getTargetPort() !== port
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
    const labelTargetContainerId = `${proxyContainerLabelContainerId}=${container}`

    await this.createContainerFromTarget(sessionName, 'container', target, [
      '--label', labelTargetContainerId,
      '--network', this.config.network,
    ])

    return this.get()
  }

  async delete() {
    const execResult = new MultiExecResult()

    const deleteExecResult = await super.delete()
    execResult.addExecResult(deleteExecResult)

    if (await this.proxyNetwork.exist()) {
      const networkRemoveExecResult = await this.proxyNetwork.remove({force: true})
      execResult.addExecResult(networkRemoveExecResult)
    }

    return execResult
  }
}
