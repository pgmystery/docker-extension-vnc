import BackendRoute from '../BackendRoute'
import { HttpService } from '@docker/extension-api-client-types/dist/v1'
import { ConnectionData } from '../../libs/vnc/VNC'
import { SessionCredentials } from '../../types/session'
import { Session as SessionData } from '../../types/session'


export type SessionList = {
  id: string
  name: string
}[]

export interface SessionCreateData {
  name: string
  connection: ConnectionData
  credentials?: SessionCredentials
}

export interface SessionUpdateData extends SessionCreateData {
  id: string
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

  update(data: SessionUpdateData) {
    return this.post<SessionData>('/' + data.id, data)
  }

  remove(sessionId: string) {
    return this.delete<void>('/' + sessionId)
  }
}
