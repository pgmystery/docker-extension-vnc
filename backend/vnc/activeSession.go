package vnc

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"vnc/crud"
)

type ActiveSessionData struct {
	Name             string                       `json:"name"`
	ProxyContainerID string                       `json:"proxy_container_id"`
	Connection       *ActiveSessionDataConnection `json:"connection"`
}

type ActiveSessionDataConnection struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data,omitempty"`
}

type ActiveSessionHandler struct {
	ActiveSessionData *ActiveSessionData
	fileSaveLock      *sync.Mutex
	filePath          string
	config            *Config
}

var ActiveSession *ActiveSessionHandler

func (activeSessionHandler *ActiveSessionHandler) Save(data ActiveSessionData) error {
	session, err := crud.GetSessionModelByName(data.Name)
	if err != nil {
		return err
	}

	defer activeSessionHandler.fileSaveLock.Unlock()
	activeSessionHandler.fileSaveLock.Lock()

	err = os.MkdirAll(activeSessionHandler.config.DataPath, os.ModePerm)
	if err != nil {
		return err
	}

	dataJSON, err := json.Marshal(data)
	if err != nil {
		return err
	}

	err = os.WriteFile(activeSessionHandler.filePath, dataJSON, os.ModePerm)
	if err != nil {
		return err
	}

	ActiveSession.ActiveSessionData = &ActiveSessionData{
		Name:             session.Name,
		ProxyContainerID: data.ProxyContainerID,
		Connection:       data.Connection,
	}

	return nil
}

func (activeSessionHandler *ActiveSessionHandler) Reset() error {
	defer activeSessionHandler.fileSaveLock.Unlock()
	activeSessionHandler.fileSaveLock.Lock()

	err := os.MkdirAll(activeSessionHandler.config.DataPath, os.ModePerm)
	if err != nil {
		return err
	}

	err = os.WriteFile(activeSessionHandler.filePath, []byte("{}"), os.ModePerm)
	if err != nil {
		return err
	}

	ActiveSession.ActiveSessionData = nil

	return nil
}

func (activeSessionHandler *ActiveSessionHandler) Exist() bool {
	return activeSessionHandler.ActiveSessionData != nil
}

func loadActiveSessionFromFile(filePath string) *ActiveSessionData {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil
	}

	var activeSessionData *ActiveSessionData

	err = json.Unmarshal(data, activeSessionData)
	if err != nil {
		return nil
	}

	return activeSessionData
}

func LoadActiveSession() {
	config, err := loadConfig()
	if err != nil {
		panic(err)
	}

	filePath := filepath.Join(".", config.DataPath, config.ActiveSessionFileName+".json")
	activeSessionData := loadActiveSessionFromFile(filePath)

	ActiveSession = &ActiveSessionHandler{
		ActiveSessionData: activeSessionData,
		fileSaveLock:      &sync.Mutex{},
		filePath:          filePath,
		config:            config,
	}
}
