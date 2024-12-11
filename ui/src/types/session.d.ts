import type { ConnectionData } from '../libs/vnc/VNC'


export interface Session {
  id: string
  name: string
  credentials?: SessionCredentials
  connection: ConnectionData
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

export interface SessionCreateData {
  name: string
  connection: ConnectionData
  credentials?: SessionCredentials
}

export interface SessionUpdateData extends SessionCreateData {
  id: string
}
