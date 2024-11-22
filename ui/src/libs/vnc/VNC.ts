import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import Target from './Target'
import Proxy from './Proxy'
import ProxyNetwork from './ProxyNetwork'


export default class VNC {
  public proxy: Proxy
  public network: ProxyNetwork
  public target: Target
  public ready: Promise<void>

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    this.network = new ProxyNetwork(docker, config)
    this.target = new Target(docker, config)
    this.proxy = new Proxy(docker, config)
    this.ready = new Promise((resolve, reject) => {
      this.proxy.ready.then(() => resolve()).catch(e => reject(e))
    })
  }

  async reconnect() {
    if (!this.proxy.exist()) return

    let targetContainerId: string, targetPort: number

    try {
      targetContainerId = this.proxy.getTargetContainerId()
      targetPort = this.proxy.getTargetPort()

      await this.connect(targetContainerId, targetPort, true)
    }
    catch (e) {
      await this.reset()

      throw e
    }
  }

  async connect(targetContainerId: string, targetPort: number, reconnect: boolean = false) {
    if (!reconnect)
      await this.disconnect()

    await this.target.setNewTargetContainer(targetContainerId)

    const targetIp = this.target.proxyNetworkIp
    if (!targetIp)
      throw new Error(
        `An Error appear while getting the target container with the id "${targetContainerId}" network ip in the network with the name ${this.network.name}`
      )

    await this.proxy.create(targetContainerId, targetIp, targetPort)
  }

  disconnect() {
    return this.reset()
  }

  async reset() {
    // 1. Delete proxy container
    // 2. Delete proxy network with detach target container

    await this.proxy.delete()
    await this.target.disconnectFromProxyNetwork()
    const proxyNetworkExist = await this.network.exist()
    if (proxyNetworkExist)
      await this.network.remove({ force: true })
  }

  get connected(): boolean {
    return this.proxy.exist() && this.target?.exist() || false
  }
}
