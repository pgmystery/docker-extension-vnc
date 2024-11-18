import { useEffect, useState } from 'react'
import { VNCSettingsData } from '../components/VNCView/VNCView'


const defaultSettings: VNCSettingsData = {
  qualityLevel: 6,
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
