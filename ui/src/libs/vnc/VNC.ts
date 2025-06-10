import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import VNCDockerContainer from './connectionTypes/VNCDockerContainer'
import Proxy from './proxies/Proxy'
import VNCRemoteHost, { ConnectionDataRemoteHost, ConnectionTypeRemoteHost } from './connectionTypes/VNCRemoteHost'
import { DockerImage } from '../../types/docker/extension'
import ActiveSessionBackend from '../../api/ActiveSession'
import VNCDockerImage, { ConnectionDataDockerImage, ConnectionTypeDockerImage } from './connectionTypes/VNCDockerImage'
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

interface VNCConstructorParams {
  docker?: Docker
  config?: Config
}

interface ProxyCheckResult {
  proxy: Proxy | null
  reconnectData: ReconnectData<ConnectionType, unknown>
}


export default class VNC {
  private static readonly CONNECTION_MAP: Record<
    ConnectionType,
    new (...args: AbstractConstructorParameters<typeof VNCConnection>) => VNCConnection<ConnectionType>
  > = {
    container: VNCDockerContainer,
    image: VNCDockerImage,
    remote: VNCRemoteHost,
  }

  private readonly docker: Docker
  private readonly config: Config
  private readonly activeSessionBackend: ActiveSessionBackend
  public connection?: VNCConnection<ConnectionType>

  constructor({docker, config}: VNCConstructorParams = {}) {
    this.docker = docker || createDockerDesktopClient().docker
    this.config = config || loadConfig()
    this.activeSessionBackend = new ActiveSessionBackend()
  }

  async reconnect(): Promise<void> {
    if (this.connection) return

    const proxyCheck = await this.checkExistingProxyAndSession()
    if (!proxyCheck) {
      return this.disconnect()
    }

    await this.establishReconnection(proxyCheck)
  }

  async connect(sessionName: string, connectionData: SessionConnectionData): Promise<void> {
    await this.disconnect()
    await this.establishNewConnection(sessionName, connectionData)
    await this.updateActiveSession(sessionName)
  }

  async disconnect(): Promise<void> {
    if (!this.connection)
      return

    await this.connection.disconnect()

    this.connection = undefined

    await this.activeSessionBackend.reset()
  }

  get connected(): boolean {
    return !!this.connection?.connected
  }

  async dockerProxyImageExist(): Promise<boolean> {
    const images = await this.docker.listImages({
      filters: {reference: [this.proxyDockerImage]},
    }) as DockerImage[]

    if (images.length > 1) {
      throw new Error(`Multiple docker images found with tag "${ this.proxyDockerImage }"`)
    }

    return images.length === 1
  }

  get proxyDockerImage(): string {
    return this.config.proxyDockerImage
  }

  private async checkExistingProxyAndSession(): Promise<ProxyCheckResult | null> {
    const proxy = await this.getExistingProxy()
    if (proxy?.container) {
      return {
        proxy,
        reconnectData: {
          type: 'proxy',
          connectionType: proxy.getConnectionType(),
          data: proxy,
        },
      }
    }

    const activeSession = await this.activeSessionBackend.get()
    if (activeSession) {
      return {
        proxy: null,
        reconnectData: {
          type: 'activeSession',
          connectionType: activeSession.connection.type,
          data: activeSession.connection.data,
          sessionName: activeSession.name,
        },
      }
    }

    return null
  }

  private async establishReconnection({proxy, reconnectData}: ProxyCheckResult): Promise<void> {
    this.connection = this.createConnectionInstance(reconnectData.connectionType)

    if (proxy) {
      this.connection.proxy.container = proxy.container
    }

    try {
      await this.connection.reconnect(reconnectData)
    }
    catch (error: any) {
      console.error(error)

      await this.disconnect()

      throw new Error(`Failed to reconnect: ${ error.message }`)
    }
  }

  private async establishNewConnection(sessionName: string, connectionData: SessionConnectionData): Promise<boolean> {
    if (!connectionData?.type) {
      throw new Error('No connection type provided')
    }

    this.connection = this.createConnectionInstance(connectionData.type)

    return this.connection.connect(sessionName, connectionData.data)
  }

  private createConnectionInstance<T extends ConnectionType>(type: T): VNCConnection<ConnectionType> {
    const ConnectionClass = VNC.CONNECTION_MAP[type]

    if (!ConnectionClass) {
      throw new Error(`Unsupported connection type: ${ type }`)
    }

    return new ConnectionClass({
      docker: this.docker,
      config: this.config,
    })
  }

  private async updateActiveSession(sessionName: string): Promise<void> {
    if (!this.connection?.proxy.container) return

    await this.activeSessionBackend.set({
      name: sessionName,
      proxy_container_id: this.connection.proxy.container.Id,
      connection: this.connection.getActiveSessionData(),
    })
  }

  private async getExistingProxy(): Promise<Proxy | undefined> {
    const proxy = new Proxy(this.docker, this.config)
    const proxyExist = await proxy.get()

    if (!proxyExist || !proxy.exist())
      return

    return proxy
  }
}
