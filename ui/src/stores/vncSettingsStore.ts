import { QualityLevelRange } from '../components/VNCView/VNCSettingForms/QualityLevel'
import { CompressionLevelRange } from '../components/VNCView/VNCSettingForms/CompressionLevel'
import { ShowDotCursorDefault } from '../components/VNCView/VNCSettingForms/ShowDotCursor'
import { ViewOnlyDefault } from '../components/VNCView/VNCSettingForms/ViewOnly'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { HttpService } from '@docker/extension-api-client-types/dist/v1'
import BackendRoute from '../api/BackendRoute'
import { ScalingDefault, ScalingSettings } from '../components/VNCView/VNCSettingForms/Scaling'


export interface VNCSettings {
  viewOnly: boolean
  qualityLevel: number
  compressionLevel: number
  showDotCursor: boolean
  scaling: ScalingSettings
}

interface VNCSettingsStoreWithoutBackend {
  subscribe: (listener: ()=>void)=>()=>void
  getSnapshot: ()=>VNCSettings
  set: (settings: VNCSettings) => void
  reset: ()=>void
}

interface VNCSettingsStore extends VNCSettingsStoreWithoutBackend {
  set: (settings: VNCSettings) => Promise<void>
  reset: ()=>Promise<void>
  api: BackendRoute
  load: ()=>Promise<void>
  save: ()=>Promise<void>
}


const defaultSettings: VNCSettings = {
  qualityLevel: QualityLevelRange.default,
  compressionLevel: CompressionLevelRange.default,
  showDotCursor: ShowDotCursorDefault,
  viewOnly: ViewOnlyDefault,
  scaling: ScalingDefault,
}
const ddClient = createDockerDesktopClient()
let vncSettings: VNCSettings = defaultSettings
let listeners: (()=>void)[] = []


const vncSettingsStoreWithoutBackend: VNCSettingsStoreWithoutBackend = {
  set(settings: VNCSettings) {
    vncSettings = settings

    emitChange()
  },

  reset() {
    vncSettings = defaultSettings

    emitChange()
  },

  subscribe(listener: ()=>void) {
    listeners = [...listeners, listener]

    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  },

  getSnapshot() {
    return vncSettings
  }
}


export function getVNCSettingsStore(backendHttpService?: HttpService): VNCSettingsStore | VNCSettingsStoreWithoutBackend {
  if (!backendHttpService) {
    backendHttpService = ddClient.extension.vm?.service
    if (!backendHttpService) return vncSettingsStoreWithoutBackend
  }

  return {
    ...vncSettingsStoreWithoutBackend,

    api: new BackendRoute(backendHttpService, '/settings'),

    async load() {
      vncSettings = await this.api.get<VNCSettings>()

      emitChange()
    },

    save() {
      return this.api.post<void>('', vncSettings)
    },

    async set(newVNCSettings: VNCSettings) {
      vncSettings = newVNCSettings

      await this.save()
    },

    async reset() {
      vncSettings = defaultSettings

      await this.save()
    },
  } as VNCSettingsStore
}


function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}
