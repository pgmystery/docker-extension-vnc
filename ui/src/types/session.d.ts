import { ConnectionData, ConnectionType } from '../libs/vnc/VNC'


export interface Session {
  id: string
  name: string
  credentials?: SessionCredentials
  connectionType: ConnectionType
  connectionData: Pick<ConnectionData, 'data'>
}

interface SessionCredentials {
  username: string
  password: string
}
