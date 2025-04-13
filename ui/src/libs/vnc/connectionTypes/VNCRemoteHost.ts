import VNCConnection, { ReconnectData } from './VNCConnection'
import { ConnectionDataActiveSession } from '../VNC'


export type ConnectionTypeRemoteHost = 'remote'
export interface ConnectionRemoteHost {
  type: ConnectionTypeRemoteHost
  data: ConnectionDataRemoteHost
}
export interface ConnectionDataRemoteHost {
  host: string
  port: number
}

export default class VNCRemoteHost extends VNCConnection<ConnectionTypeRemoteHost> {
  public type: ConnectionTypeRemoteHost = 'remote'
  public data: ConnectionDataRemoteHost | null = null

  async reconnect(data: ReconnectData<ConnectionTypeRemoteHost, ConnectionDataRemoteHost>) {
    let targetIp, targetPort, sessionName

    switch (data.type) {
      case 'proxy':
        sessionName = this.proxy.getSessionName()
        targetIp = this.proxy.getTargetIp()
        targetPort = this.proxy.getTargetPort()

        break

      case 'activeSession':
        sessionName = data.sessionName
        targetIp = data.data.host
        targetPort = data.data.port

        break
    }

    await this.connect(sessionName, {host: targetIp, port: targetPort})
  }

  async connect(sessionName: string, data: ConnectionDataRemoteHost) {
    const { host, port } = data
    await this.target.connect(host, port)
    this.data = data

    return super._connect(sessionName, data)
  }

  getActiveSessionData(): ConnectionDataActiveSession<ConnectionTypeRemoteHost, ConnectionDataRemoteHost | null> {
    return {
      type: this.type,
      data: this.data,
    }
  }
}
