import BackendRoute from '../BackendRoute'
import { HttpService } from '@docker/extension-api-client-types/dist/v1'
import { ConnectionType } from '../../libs/vnc/VNC'
import { ConnectionData } from '../../components/session/sessionDialog/SessionDialogConnection'
import { SessionCredentials } from '../../types/session'
import { Session as SessionData } from '../../types/session'


export type SessionList = {
  id: string
  name: string
}[]

export interface SessionCreateData {
  name: string
  connectionType: ConnectionType
  connectionData: ConnectionData
  credentials?: SessionCredentials
}


export default class Session extends BackendRoute {
  constructor(backendAPI: HttpService) {
    super(backendAPI, '/session')
  }

  getAll() {
    return this.get<SessionList>('')
  }

  getFromId(sessionId: string) {
    return this.get<SessionData>('/' + sessionId)
  }

  create(data: SessionCreateData) {
    return this.post<SessionData>('', data)
  }

  edit(sessionId: string, data: SessionCreateData) {
    return this.post<SessionData>('/' + sessionId, data)
  }

  remove(sessionId: string) {
    return this.delete<void>('/' + sessionId)
  }
}
