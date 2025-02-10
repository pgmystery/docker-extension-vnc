import BackendRoute from '../api/BackendRoute'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Session, SessionCreateData, SessionList, SessionUpdateData } from '../types/session'
import { HttpService } from '@docker/extension-api-client-types/dist/v1'


export interface SessionStore {
  subscribe: (listener: ()=>void)=>()=>void
  getSnapshot: ()=>SessionList
  api: BackendRoute
  refresh: ()=>Promise<void>
  getSessionByName: (name: string)=>Promise<Session | undefined>
  add: (data: SessionCreateData)=>Promise<void>
  update: (data: SessionUpdateData)=>Promise<void>
  delete: (sessionId: string)=>Promise<void>
}

const ddClient = createDockerDesktopClient()
let sessions: SessionList = []
let listeners: (()=>void)[] = []

export function getSessionStore(backendHttpService?: HttpService): SessionStore | undefined {
  if (!backendHttpService) {
    backendHttpService = ddClient.extension.vm?.service
    if (!backendHttpService) return
  }

  return {
    api: new BackendRoute(backendHttpService, '/session'),

    async refresh() {
      const newSessions: SessionList = []
      const newSessionList = await this.api.get<SessionList>()

      for (const sessionItem of newSessionList) {
        newSessions.push({
          ...sessionItem,
          getInfo: async () => this.api.get<Session>('/' + sessionItem.id)
        })
      }

      sessions = newSessions
      emitChange()
    },

    async getSessionByName(name: string) {
      const sessionItem = sessions.find(session => session.name === name)
      if (!sessionItem) return

      return sessionItem.getInfo()
    },

    async add(data: SessionCreateData) {
      await this.api.post<Session>('', data)
      await this.refresh()
    },

    async update(data: SessionUpdateData) {
      await this.api.post<Session>('/' + data.id, data)
      await this.refresh()
    },

    async delete(sessionId: string) {
      await this.api.delete<void>('/' + sessionId)
      await this.refresh()
    },

    subscribe(listener: ()=>void) {
      listeners = [...listeners, listener]

      return () => {
        listeners = listeners.filter(l => l !== listener)
      }
    },

    getSnapshot() {
      return sessions
    }
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}
