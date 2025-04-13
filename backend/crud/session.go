package crud

import (
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"vnc/database"
	"vnc/model"
	"vnc/model/connections"
)

type RequestCreateSession struct {
	Name        string                         `json:"name"`
	Connection  RequestCreateSessionConnection `json:"connection"`
	Credentials *model.SessionCredentialData   `json:"credentials,omitempty"`
}

type RequestCreateSessionConnection struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

type RequestCreateSessionRemoteHost struct {
	RequestCreateSession
	ConnectionData connections.RemoteHost `json:"connectionData"`
}

type RequestCreateSessionDockerContainer struct {
	RequestCreateSession
	ConnectionData connections.DockerContainer `json:"connectionData"`
}

type RequestCreateSessionDockerImage struct {
	RequestCreateSession
	ConnectionData connections.DockerImage `json:"connectionData"`
}

type ResponseSessionList struct {
	Id   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type ResponseSession struct {
	Id          uuid.UUID                 `json:"id"`
	Name        string                    `json:"name"`
	Connection  ResponseSessionConnection `json:"connection"`
	Credentials *model.SessionCredentials `json:"credentials,omitempty"`
}

type ResponseSessionConnection struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type SessionUpdate struct {
	Name        string                         `json:"name"`
	Connection  RequestCreateSessionConnection `json:"connection"`
	Credentials *model.SessionCredentialData   `json:"credentials,omitempty"`
}

func GetSessions() []ResponseSessionList {
	db := database.DB
	var sessions []model.Session
	var responseSessions []ResponseSessionList

	db.Find(&sessions)

	for _, session := range sessions {
		responseSessions = append(responseSessions, ResponseSessionList{
			Id:   session.ID,
			Name: session.Name,
		})
	}

	return responseSessions
}

func GetSessionModel(id uuid.UUID) (*model.Session, error) {
	db := database.DB
	var session model.Session

	err := db.Model(&model.Session{}).Preload("Credentials").Find(&session, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	if session.ID == uuid.Nil {
		return nil, errors.New("session not found")
	}

	return &session, nil
}

func GetSessionModelByName(name string) (*model.Session, error) {
	db := database.DB
	var session model.Session

	err := db.Model(&model.Session{}).Preload("Credentials").Find(&session, "name = ?", name).Error
	if err != nil {
		return nil, err
	}
	if session.ID == uuid.Nil {
		return nil, errors.New("session not found")
	}

	return &session, nil
}

func GetSession(id uuid.UUID) (*ResponseSession, error) {
	session, err := GetSessionModel(id)
	if err != nil {
		return nil, err
	}

	connectionData, err := getConnection(session.ConnectionType, session.ConnectionDataId)
	if err != nil {
		return nil, err
	}

	return &ResponseSession{
		Id:   session.ID,
		Name: session.Name,
		Connection: ResponseSessionConnection{
			Type: session.ConnectionType,
			Data: connectionData,
		},
		Credentials: session.Credentials,
	}, nil
}

func CreateSession(requestSession *RequestCreateSession) (*model.Session, error) {
	db := database.DB

	if _, err := GetSessionModelByName(requestSession.Name); err == nil {
		return nil, errors.New("[SESSION_CREATE_ERROR]: A session with the name '" + requestSession.Name + "' already exists")
	}

	sessionConnectionId, err := createConnection(requestSession.Connection.Type, requestSession.Connection.Data)
	if err != nil {
		return nil, err
	}

	session := model.Session{
		Name:             requestSession.Name,
		ConnectionType:   requestSession.Connection.Type,
		ConnectionDataId: sessionConnectionId,
	}

	if requestSession.Credentials != nil {
		session.Credentials = &model.SessionCredentials{
			SessionCredentialData: *requestSession.Credentials,
		}
	}

	return &session, db.Create(&session).Error
}

func UpdateSession(id uuid.UUID, sessionUpdate *SessionUpdate) (*ResponseSession, error) {
	db := database.DB

	oldSession, err := GetSessionModel(id)
	if err != nil {
		return nil, err
	}

	if oldSession.ID == uuid.Nil {
		return nil, errors.New("session not found")
	}

	// UPDATE DATA:
	oldSession.Name = sessionUpdate.Name

	// Create new connection
	newSessionConnectionId, err := createConnection(sessionUpdate.Connection.Type, sessionUpdate.Connection.Data)
	if err != nil {
		return nil, err
	}

	// Delete old connection
	err = deleteConnection(oldSession.ConnectionType, oldSession.ConnectionDataId)
	if err != nil {
		return nil, err
	}

	// Update connection id
	oldSession.ConnectionType = sessionUpdate.Connection.Type
	oldSession.ConnectionDataId = newSessionConnectionId

	// delete old credentials
	if oldSession.Credentials != nil {
		err = db.Unscoped().Delete(&oldSession.Credentials).Error
		if err != nil {
			return nil, err
		}

		oldSession.Credentials = nil
	}

	// update new credentials
	if sessionUpdate.Credentials != nil {
		sessionCredentials := model.SessionCredentials{SessionCredentialData: *sessionUpdate.Credentials}
		oldSession.Credentials = &sessionCredentials
	}

	err = db.Save(oldSession).Error
	if err != nil {
		return nil, err
	}

	return GetSession(oldSession.ID)
}

func DeleteSession(id uuid.UUID) error {
	db := database.DB

	session, err := GetSessionModel(id)
	if err != nil {
		return err
	}

	// Delete Credentials
	if session.Credentials != nil {
		var credentials model.SessionCredentials
		db.Find(&credentials, "id = ?", session.Credentials.ID)
		if credentials.ID != uuid.Nil {
			err = db.Unscoped().Delete(&credentials, "id = ?", credentials.ID).Error
			if err != nil {
				return err
			}
		}
	}

	// Delete Connection
	err = deleteConnection(session.ConnectionType, session.ConnectionDataId)
	if err != nil {
		return err
	}

	return db.Unscoped().Delete(&session, "id = ?", id).Error
}

func getConnection(connectionType string, connectionId uuid.UUID) (interface{}, error) {
	db := database.DB
	var connectionData interface{}

	switch connectionType {
	case "remote":
		var connectionDataRemoteHost connections.RemoteHost

		err := db.Find(&connectionDataRemoteHost, "id = ?", connectionId).Error
		if err != nil {
			return nil, err
		}

		connectionData = connectionDataRemoteHost

		break
	case "container":
		var connectionDataDockerContainer connections.DockerContainer

		err := db.Find(&connectionDataDockerContainer, "id = ?", connectionId).Error
		if err != nil {
			return nil, err
		}

		connectionData = connectionDataDockerContainer

		break

	case "image":
		var connectionDataDockerImage connections.DockerImage

		err := db.Find(&connectionDataDockerImage, "id = ?", connectionId).Error
		if err != nil {
			return nil, err
		}

		connectionData = connectionDataDockerImage

		break
	}

	return connectionData, nil
}

func createConnection(connectionType string, connectionData json.RawMessage) (uuid.UUID, error) {
	db := database.DB

	switch connectionType {
	case "remote":
		var connectionSession connections.RemoteHost
		err := json.Unmarshal(connectionData, &connectionSession)

		if err != nil {
			return uuid.Nil, err
		}

		err = db.Create(&connectionSession).Error

		if err != nil {
			return uuid.Nil, err
		}

		return connectionSession.ID, nil

	case "container":
		var connectionSession connections.DockerContainer
		err := json.Unmarshal(connectionData, &connectionSession)

		if err != nil {
			return uuid.Nil, err
		}

		err = db.Create(&connectionSession).Error

		if err != nil {
			return uuid.Nil, err
		}

		return connectionSession.ID, nil

	case "image":
		var connectionSession connections.DockerImage
		err := json.Unmarshal(connectionData, &connectionSession)

		if err != nil {
			return uuid.Nil, err
		}

		err = db.Create(&connectionSession).Error

		if err != nil {
			return uuid.Nil, err
		}

		return connectionSession.ID, nil

	default:
		return uuid.Nil, errors.New("invalid connection type")
	}
}

func deleteConnection(connectionType string, connectionId uuid.UUID) error {
	db := database.DB

	switch connectionType {
	case "remote":
		var connectionDataRemoteHost connections.RemoteHost

		db.Find(&connectionDataRemoteHost, "id = ?", connectionId)

		if connectionDataRemoteHost.ID != uuid.Nil {
			err := db.Unscoped().Delete(&connectionDataRemoteHost, "id = ?", connectionDataRemoteHost.ID).Error

			if err != nil {
				return err
			}
		}

		break
	case "container":
		var connectionDataDockerContainer connections.DockerContainer

		db.Find(&connectionDataDockerContainer, "id = ?", connectionId)

		if connectionDataDockerContainer.ID != uuid.Nil {
			err := db.Unscoped().Delete(&connectionDataDockerContainer, "id = ?", connectionDataDockerContainer.ID).Error

			if err != nil {
				return err
			}
		}

		break

	case "image":
		var connectionDataDockerImage connections.DockerImage

		db.Find(&connectionDataDockerImage, "id = ?", connectionId)

		if connectionDataDockerImage.ID != uuid.Nil {
			err := db.Unscoped().Delete(&connectionDataDockerImage, "id = ?", connectionDataDockerImage.ID).Error

			if err != nil {
				return err
			}
		}

		break
	}

	return nil
}
