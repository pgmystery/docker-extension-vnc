import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import VNCDockerContainer from './connectionTypes/VNCDockerContainer'
import Proxy from './proxies/Proxy'
import VNCRemoteHost, {
  ConnectionDataRemoteHost,
  ConnectionTypeRemoteHost
} from './connectionTypes/VNCRemoteHost'
import { DockerImage } from '../../types/docker/extension'
import ActiveSessionBackend from '../../api/ActiveSession'
import VNCDockerImage, {
  ConnectionDataDockerImage,
  ConnectionTypeDockerImage
} from './connectionTypes/VNCDockerImage'
import {
  ConnectionDataDockerContainer,
  ConnectionTypeDockerContainer
} from './connectionTypes/VNCDockerContainer/VNCDockerContainerBase'
import { SessionConnectionData } from '../../types/session'
import VNCConnection, { ReconnectData } from './connectionTypes/VNCConnection'
import { AbstractConstructorParameters } from '../../types/utils'


export type ConnectionType = ConnectionTypeDockerContainer | ConnectionTypeRemoteHost | ConnectionTypeDockerImage
export type ConnectionData = ConnectionDataDockerContainer | ConnectionDataRemoteHost | ConnectionDataDockerImage
export interface ConnectionDataActiveSession<T extends ConnectionType, D> {
  type: T
  data: D
}
type VNCConnectionConstructor = AbstractConstructorParameters<typeof VNCConnection>


export default class VNC {
  private readonly docker: Docker
  private readonly config: Config
  private readonly activeSessionBackend: ActiveSessionBackend
  public connection?: VNCConnection<ConnectionType>

  private readonly connectionMap: Record<ConnectionType, new (...args: VNCConnectionConstructor) => VNCConnection<ConnectionType>> = {
    container: VNCDockerContainer,
    image: VNCDockerImage,
    remote: VNCRemoteHost,
  }

  constructor(docker?: Docker, config?: Config) {
    this.docker = docker || createDockerDesktopClient().docker
    this.config = config || loadConfig()
    this.activeSessionBackend = new ActiveSessionBackend()
  }

  async reconnect() {
    if (this.connection)
      return

    const proxy = await this.getExistingProxy()

    let reconnectData: ReconnectData<ConnectionType, unknown> | null = null

    if (proxy?.container) {
      reconnectData = {
        type: 'proxy',
        connectionType: proxy.getConnectionType(),
        data: proxy,
      }
    }
    else {
      const activeSession = await this.activeSessionBackend.get()

      if (activeSession) {
        reconnectData = {
          type: 'activeSession',
          connectionType: activeSession.connection.type,
          data: activeSession.connection.data,
          sessionName: activeSession.name,
        }
      }
    }

    if (!reconnectData)
      return this.disconnect()

    this.connection = this.getConnectionClass(reconnectData.connectionType)

    if (proxy) {
      this.connection.proxy.container = proxy.container
    }

    try {
      await this.connection.reconnect(reconnectData)
    }
    catch (e) {
      console.error(e)

      await this.disconnect()

      throw e
    }
  }

  async connect(sessionName: string, connectionData: SessionConnectionData) {
    await this.disconnect()

    await this.newConnection(sessionName, connectionData)

    if (!this.connection?.proxy.container)
      return

    await this.activeSessionBackend.set({
      name: sessionName,
      proxy_container_id: this.connection.proxy.container.Id,
      connection: this.connection.getActiveSessionData(),
    })
  }

  async disconnect() {
    if (!this.connection)
      return

    await this.connection.disconnect()
    this.connection = undefined

    await this.activeSessionBackend.reset()
  }

  get connected(): boolean {
    return !!this.connection?.connected
  }

  private newConnection(sessionName: string, connectionData: SessionConnectionData) {
    if (!connectionData?.type)
      throw new Error('No connection type provided')

    this.connection = this.getConnectionClass(connectionData.type)
    return this.connection.connect(sessionName, connectionData.data)
  }

  private getConnectionClass<T extends ConnectionType>(type: T) {
    const ConnectionClass = this.connectionMap[type]

    if (!ConnectionClass) {
      throw new Error(`Unsupported connection type: ${type}`)
    }

    return new ConnectionClass({
      docker: this.docker,
      config: this.config,
    })
  }

  private async getExistingProxy() {
    const proxy = new Proxy(this.docker, this.config)
    const proxyExist = await proxy.get()

    if (!proxyExist || !proxy.exist())
      return

    return proxy
  }

  async dockerProxyImageExist(): Promise<boolean> {
    const images = await this.docker.listImages({
      filters: {
        reference: [this.config.proxyDockerImage],
      },
    }) as DockerImage[]

    if (images.length > 1)
      throw new Error(`Multiple docker images found with tag "${this.config.proxyDockerImage}"`)

    return images.length === 1
  }

  get proxyDockerImage() {
    return this.config.proxyDockerImage
  }
}
