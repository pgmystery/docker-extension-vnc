import { NewConnectionDockerContainerData } from '../libs/vnc/connectionTypes/VNCDockerContainer'
import { ConnectionDockerImage } from '../libs/vnc/connectionTypes/VNCDockerImage'
import { ConnectionRemoteHost } from '../libs/vnc/connectionTypes/VNCRemoteHost'


export interface Session {
  id: string
  name: string
  credentials?: SessionCredentials
  connection: SessionConnectionData
}

interface SessionCredentials {
  username: string
  password: string
}

export interface SessionItem {
  id: string
  name: string
  getInfo: ()=>Promise<Session>
}
export type SessionList = SessionItem[]

export type SessionConnectionData = NewConnectionDockerContainerData | ConnectionDockerImage | ConnectionRemoteHost
export interface SessionCreateData {
  name: string
  connection: SessionConnectionData
  credentials?: SessionCredentials
}

export interface SessionUpdateData extends SessionCreateData {
  id: string
}
