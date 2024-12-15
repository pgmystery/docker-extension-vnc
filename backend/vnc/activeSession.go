package vnc

import (
	"encoding/json"
	"github.com/google/uuid"
	"os"
	"path/filepath"
	"sync"
	"vnc/crud"
	"vnc/model"
)

type ActiveSessionRequest struct {
	ID               string `json:"id"`
	ProxyContainerID string `json:"proxy_container_id"`
}

type ActiveSessionData struct {
	*model.Session   `json:"Session"`
	ProxyContainerID string `json:"proxy_container_id"`
}

type ActiveSessionHandler struct {
	ActiveSession *ActiveSessionData
	fileSaveLock  *sync.Mutex
	filePath      string
	config        *Config
}

var ActiveSession *ActiveSessionHandler

func (activeSessionHandler *ActiveSessionHandler) Save(data ActiveSessionRequest) error {
	sessionId, err := uuid.Parse(data.ID)
	if err != nil {
		return err
	}

	session, err := crud.GetSessionModel(sessionId)
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

	ActiveSession.ActiveSession = &ActiveSessionData{
		Session:          session,
		ProxyContainerID: data.ProxyContainerID,
	}

	return nil
}

func (activeSessionHandler *ActiveSessionHandler) Exist() bool {
	return activeSessionHandler.ActiveSession != nil
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
	activeSession := loadActiveSessionFromFile(filePath)

	ActiveSession = &ActiveSessionHandler{
		ActiveSession: activeSession,
		fileSaveLock:  &sync.Mutex{},
		filePath:      filePath,
		config:        config,
	}
}
