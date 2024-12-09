import { ConnectionData } from '../libs/vnc/VNC'


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
