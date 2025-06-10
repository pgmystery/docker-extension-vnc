import VNCConnection, { ReconnectData } from '../VNCConnection'
import TargetDockerContainer from '../../targets/TargetDockerContainer'
import ProxyNetwork from '../../ProxyNetwork'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import ProxyDockerContainer from '../../proxies/ProxyDockerContainer'
import { ConnectionType } from '../../VNC'


interface ContainerReconnectData<T extends ConnectionDataDockerContainer> {
  sessionName: string
  connectionData: T
}

export type ConnectionTypeDockerContainer = 'container'
export interface ConnectionDataDockerContainer {
  container: string
  port: number
  stopAfterDisconnect?: boolean
}


export default abstract class VNCDockerContainerBase extends VNCConnection<ConnectionType> {
  declare proxy: ProxyDockerContainer
  declare target: TargetDockerContainer
  public network: ProxyNetwork
  public type: ConnectionType = 'container'

  data: ConnectionDataDockerContainer | null = null

  protected constructor(docker?: Docker, config?: Config, target?: TargetDockerContainer) {
    docker = docker || createDockerDesktopClient().docker
    config = config || loadConfig()

    const proxyNetwork = new ProxyNetwork(docker, config)
    const proxy = new ProxyDockerContainer(proxyNetwork, docker, config)
    const newTarget = target || new TargetDockerContainer(proxyNetwork, docker, config)

    super({
      docker,
      config,
      proxy,
      target: newTarget,
    })

    this.network = proxyNetwork
  }

  async getContainerConnectData(data: ConnectionDataDockerContainer): Promise<ConnectionDataDockerContainer> {
    await this.target.connect(data.container, data.port)
    const targetContainerId = this.target.getContainerId()

    if (!targetContainerId)
      throw new Error(`Can't get target container "${data.container}" ID`)

    if (this.proxy.container) {
      const isProxyContainerInNetwork = await this.network.hasContainer(this.proxy.container.Id)

      if (!isProxyContainerInNetwork || this.proxy.getTargetIp() !== this.target.ip)
        await this.proxy.disconnect()
    }

    return {
      container: targetContainerId,
      port: data.port,
      stopAfterDisconnect: data.stopAfterDisconnect || false,
    }
  }

  async disconnect() {
    await super.disconnect()

    if (await this.network.exist())
      await this.network.remove({ force: true })
  }

  getActiveSessionData(): {type: ConnectionType, data: ConnectionDataDockerContainer | null} {
    return {
      type: 'container',
      data: this.data,
    }
  }

  protected async getReconnectData<T extends ConnectionType, D extends ConnectionDataDockerContainer>(data: ReconnectData<T, D>): Promise<ContainerReconnectData<ConnectionDataDockerContainer> | ContainerReconnectData<D>> {
    switch (data.type) {
      case 'proxy':
        const targetContainerId = this.proxy.getTargetContainerId()
        const targetPort = this.proxy.getTargetPort()
        const sessionName = this.proxy.getSessionName()

        return {
          sessionName,
          connectionData: {
            container: targetContainerId,
            port: targetPort
          }
        }

      case 'activeSession':
        return {
          sessionName: data.sessionName,
          connectionData: data.data,
        }
    }
  }
}
