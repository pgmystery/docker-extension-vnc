package vnc

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

type SettingsHandler struct {
	Data         SettingsData
	fileSaveLock *sync.Mutex
	filePath     string
	config       *Config
}

var Settings *SettingsHandler

func (vncSettings *SettingsHandler) Save(settings SettingsData) error {
	defer vncSettings.fileSaveLock.Unlock()
	vncSettings.fileSaveLock.Lock()

	err := os.MkdirAll(vncSettings.config.DataPath, os.ModePerm)
	if err != nil {
		return err
	}

	settingsJSON, err := json.Marshal(settings)
	if err != nil {
		return err
	}

	err = os.WriteFile(vncSettings.filePath, settingsJSON, os.ModePerm)
	if err != nil {
		return err
	}

	vncSettings.Data = settings

	return nil
}

func loadSettingsFromFile(settingsFilePath string) SettingsData {
	settingsData := getDefaultSettings()

	data, err := os.ReadFile(settingsFilePath)
	if err != nil {
		return settingsData
	}

	err = json.Unmarshal(data, &settingsData)
	if err != nil {
		return getDefaultSettings()
	}

	return settingsData
}

func LoadVNCSettings() {
	config, err := loadConfig()
	if err != nil {
		panic(err)
	}

	settingsFilePath := filepath.Join(".", config.DataPath, config.SettingsFileName+".json")
	vncSettings := loadSettingsFromFile(settingsFilePath)

	Settings = &SettingsHandler{
		Data:         vncSettings,
		config:       config,
		filePath:     settingsFilePath,
		fileSaveLock: &sync.Mutex{},
	}
}
