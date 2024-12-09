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
	Credentials model.SessionCredentials       `json:"credentials,omitempty"`
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
	Name        string                    `json:"name"`
	Credentials *model.SessionCredentials `json:"credentials,omitempty"`
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

func GetSession(id string) ResponseSession {
	db := database.DB
	var session model.Session

	db.Find(&session, "id = ?", id)

	var connectionData interface{}
	switch session.ConnectionType {
	case "remote":
		var connectionDataRemoteHost connections.RemoteHost
		db.Find(&connectionDataRemoteHost, "id = ?", session.ConnectionDataId)

		connectionData = connectionDataRemoteHost

		break
	case "container":
		var connectionDataDockerContainer connections.DockerContainer
		db.Find(&connectionDataDockerContainer, "id = ?", session.ConnectionDataId)

		connectionData = connectionDataDockerContainer

		break
	}

	return ResponseSession{
		Id:   session.ID,
		Name: session.Name,
		Connection: ResponseSessionConnection{
			Type: session.ConnectionType,
			Data: connectionData,
		},
		Credentials: session.Credentials,
	}
}

func CreateSession(requestSession *RequestCreateSession) (*model.Session, error) {
	db := database.DB

	var sessionConnectionId uuid.UUID
	switch requestSession.Connection.Type {
	case "remote":
		var connectionSession connections.RemoteHost
		err := json.Unmarshal(requestSession.Connection.Data, &connectionSession)

		if err != nil {
			return nil, err
		}

		err = db.Create(&connectionSession).Error

		if err != nil {
			return nil, err
		}

		sessionConnectionId = connectionSession.ID

		break
	case "container":
		var connectionSession connections.DockerContainer
		err := json.Unmarshal(requestSession.Connection.Data, &connectionSession)

		if err != nil {
			return nil, err
		}

		err = db.Create(&connectionSession).Error

		if err != nil {
			return nil, err
		}

		sessionConnectionId = connectionSession.ID

		break
	default:
		return nil, errors.New("invalid connection type")
	}

	session := model.Session{
		Name:             requestSession.Name,
		Credentials:      &requestSession.Credentials,
		ConnectionType:   requestSession.Connection.Type,
		ConnectionDataId: sessionConnectionId,
	}

	return &session, db.Create(&session).Error
}

func UpdateSession(id string, sessionUpdate *SessionUpdate) (*ResponseSession, error) {
	db := database.DB

	session := GetSession(id)
	if session.Id == uuid.Nil {
		return nil, errors.New("session not found")
	}

	session.Name = sessionUpdate.Name

	if sessionUpdate.Credentials != nil {
		session.Credentials = sessionUpdate.Credentials
	}

	db.Save(&session)

	return &session, nil
}

func DeleteSession(id string) error {
	db := database.DB
	var session model.Session

	db.Find(&session, "id = ?", id)

	if session.ID == uuid.Nil {
		return errors.New("session not found")
	}

	// Delete Credentials
	var credentials model.SessionCredentials
	db.Find(&credentials, "id = ?", session.Credentials.ID)
	if credentials.ID != uuid.Nil {
		err := db.Delete(&credentials, "id = ?", credentials.ID).Error
		if err != nil {
			return err
		}
	}

	// Delete Connection
	switch session.ConnectionType {
	case "remote":
		var connectionDataRemoteHost connections.RemoteHost

		db.Find(&connectionDataRemoteHost, "id = ?", session.ConnectionDataId)

		if connectionDataRemoteHost.ID != uuid.Nil {
			err := db.Delete(&connectionDataRemoteHost, "id = ?", connectionDataRemoteHost.ID).Error

			if err != nil {
				return err
			}
		}

		break
	case "container":
		var connectionDataDockerContainer connections.DockerContainer

		db.Find(&connectionDataDockerContainer, "id = ?", session.ConnectionDataId)

		if connectionDataDockerContainer.ID != uuid.Nil {
			err := db.Delete(&connectionDataDockerContainer, "id = ?", connectionDataDockerContainer.ID).Error

			if err != nil {
				return err
			}
		}
	}

	return db.Delete(&session, "id = ?", id).Error
}
