import Proxy from '../proxies/Proxy'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import Target from '../targets/Target'
import { ConnectionData, ConnectionDataActiveSession, ConnectionType } from '../VNC'


interface ReconnectDataBase<T extends string, CT extends ConnectionType, D> {
  type: T
  data: D
  connectionType: CT
}
type ReconnectDataProxy<T extends ConnectionType> = ReconnectDataBase<'proxy', T, Proxy>
interface ReconnectDataActiveSession<T extends ConnectionType, D> extends ReconnectDataBase<'activeSession', T, D> {
  sessionName: string
}
export type ReconnectData<T extends ConnectionType, D> = ReconnectDataProxy<T> | ReconnectDataActiveSession<T, D>
export interface VNCConnectionProps {
  docker?: Docker
  config?: Config
  proxy?: Proxy
  target?: Target
}


export default abstract class VNCConnection<T extends ConnectionType> {
  protected docker: Docker
  protected config: Config
  abstract type: T
  public proxy: Proxy
  public target: Target
  public data: any

  constructor(props: VNCConnectionProps) {
    const { docker, config, proxy, target } = props

    this.docker = docker || createDockerDesktopClient().docker
    this.config = config || loadConfig()
    this.proxy = proxy || new Proxy(docker, config)
    this.target = target || new Target(docker, config)
  }

  abstract connect(sessionName: string, data: ConnectionData, labels?: {[key: string]: string}): Promise<boolean>
  abstract reconnect(data: ReconnectData<ConnectionType, unknown>): Promise<void>
  abstract getActiveSessionData(): ConnectionDataActiveSession<ConnectionType, any>

  async _connect<T extends ConnectionData>(sessionName: string, connectionData: T, labels?: {[key: string]: string}) {
    if (this.proxy.container)
      return true

    return this.proxy.create(sessionName, this.type, this.target, connectionData, labels)
  }

  async disconnect() {
    await this.target.disconnect()

    if (this.proxy.exist())
      await this.proxy.disconnect()
  }

  get connected(): boolean {
    return this.proxy?.exist() || false
  }
}
