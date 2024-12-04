package crud

import (
	"errors"
	"github.com/google/uuid"
	"vnc/database"
	"vnc/model"
)

type ResponseSession struct {
	Id   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type SessionUpdate struct {
	Name        string                    `json:"name"`
	Credentials *model.SessionCredentials `json:"credentials,omitempty"`
}

func GetSessions() []ResponseSession {
	db := database.DB
	var sessions []model.Session
	var responseSessions []ResponseSession

	db.Find(&sessions)

	for _, session := range sessions {
		responseSessions = append(responseSessions, ResponseSession{
			Id:   session.Id,
			Name: session.Name,
		})
	}

	return responseSessions
}

func GetSession(id string) model.Session {
	db := database.DB
	var session model.Session

	db.Find(&session, "id = ?", id)

	return session
}

func CreateSession(session *model.Session) error {
	db := database.DB

	return db.Create(session).Error
}

func UpdateSession(id string, sessionUpdate *SessionUpdate) (*model.Session, error) {
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
	if session.Id == uuid.Nil {
		return errors.New("session not found")
	}

	return db.Delete(&session, "id = ?", id).Error
}
