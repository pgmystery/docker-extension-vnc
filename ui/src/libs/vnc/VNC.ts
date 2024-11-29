import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import VNCDockerContainer, {
  ConnectionDataDockerContainer,
  ConnectionTypeDockerContainer
} from './connectionTypes/VNCDockerContainer'
import Proxy from './proxies/Proxy'
import VNCRemoteHost, { ConnectionTypeRemoteHost } from './connectionTypes/VNCRemoteHost'
import { DockerImage } from '../../types/docker/extension'


export type ConnectionType = ConnectionTypeDockerContainer | ConnectionTypeRemoteHost
export type VNCConnectionType = VNCDockerContainer | VNCRemoteHost
export type ConnectionData = ConnectionDataDockerContainer


export default class VNC {
  private readonly docker: Docker
  private readonly config: Config
  public connection?: VNCConnectionType

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    this.docker = docker
    this.config = config
  }

  async reconnect() {
    if (this.connection) return

    const proxy = await this.getExistingProxy()
    if (!proxy || !proxy.container) return

    this.connection = this.getNewConnection(proxy.getConnectionType())

    await this.connection.reconnect(proxy.container)
  }

  async connect(connectionData: ConnectionData) {
    await this.disconnect()

    this.connection = this.getNewConnection(connectionData.type)

    await this.connection.connect(connectionData.type, connectionData.data)
  }

  async disconnect() {
    if (!this.connection) return

    await this.connection.disconnect()
    this.connection = undefined
  }

  get connected(): boolean {
    if (!this.connection) return false

    return this.connection.connected
  }

  private getNewConnection(connectionType: ConnectionType) {
    let connection: VNCConnectionType | undefined

    switch (connectionType) {
      case 'container':
        connection = new VNCDockerContainer(this.docker, this.config)
        break
    }

    if (!connection)
      throw new Error(`Unknown connection type ${connectionType}`)

    return connection
  }

  private async getExistingProxy() {
    const proxy = new Proxy(this.docker, this.config)
    const proxyExist = await proxy.get()

    if (!proxyExist || !proxy.exist()) return

    return proxy
  }

  async dockerProxyImageExist(): Promise<boolean> {
    const images = await this.docker.listImages({
      filters: {
        reference: [this.config.proxyDockerImage]
      }
    }) as DockerImage[]

    if (images.length > 1)
      throw new Error(`Found no or multiple docker images with tag "${this.config.proxyDockerImage}"`)

    return images.length === 1
  }

  pullProxyDockerImage(addStdout: (stdout: string)=>void, onFinish: (exitCode: number)=>void) {
    this.docker.cli.exec('pull', [this.config.proxyDockerImage], {
      stream: {
        onOutput(data) {
          if (data.stdout) {
            addStdout(data.stdout)
          }

          if (data.stderr) {
            throw new Error(data.stderr)
          }
        },
        onError(error) {
          throw error
        },
        onClose(exitCode) {
          onFinish(exitCode)
        },
        splitOutputLines: true,
      },
    })
  }
}
