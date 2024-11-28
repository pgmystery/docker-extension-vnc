import { useEffect, useState } from 'react'
import { VNCSettingsData } from '../components/VNCView/VNCView'
import { CompressionLevelRange } from '../components/VNCView/VNCSettingForms/CompressionLevel'
import { QualityLevelRange } from '../components/VNCView/VNCSettingForms/QualityLevel'
import { ShowDotCursorDefault } from '../components/VNCView/VNCSettingForms/ShowDotCursor'
import { ViewOnlyDefault } from '../components/VNCView/VNCSettingForms/ViewOnly'


const defaultSettings: VNCSettingsData = {
  qualityLevel: QualityLevelRange.default,
  compressionLevel: CompressionLevelRange.default,
  showDotCursor: ShowDotCursorDefault,
  viewOnly: ViewOnlyDefault,
}


export default function useVNCSettings(): [VNCSettingsData, (settings: VNCSettingsData)=>void] {
  const [settings, setSettings] = useState<VNCSettingsData>(defaultSettings)

  useEffect(() => {
    loadSettings()
  }, [])

  function loadSettings() {
    const settingsJSON = localStorage.getItem('vncSettings')
    if (!settingsJSON) return defaultSettings

    const settings = JSON.parse(settingsJSON) as VNCSettingsData
    setSettings(settings)
  }

  function saveSettings(settings: VNCSettingsData) {
    setSettings(settings)

    localStorage.setItem("vncSettings", JSON.stringify(settings))
  }

  return [
    settings,
    saveSettings,
  ]
}
