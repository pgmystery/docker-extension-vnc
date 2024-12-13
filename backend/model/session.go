package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Session struct {
	gorm.Model
	ID               uuid.UUID           `gorm:"type:uuid;primary_key;" json:"id"`
	Name             string              `gorm:"type:varchar(255);not null;unique;" json:"name"`
	Credentials      *SessionCredentials `gorm:"default:null;foreignKey:SessionID" json:"credentials,omitempty"`
	ConnectionType   string              `gorm:"type:varchar(255);not null;" json:"connectionType"`
	ConnectionDataId uuid.UUID           `gorm:"type:uuid;"`
}

type SessionCredentials struct {
	gorm.Model
	ID uuid.UUID `gorm:"type:uuid;primary_key;"`
	SessionCredentialData
	SessionID uuid.UUID
}

type SessionCredentialData struct {
	Username string `gorm:"type:varchar(255);" json:"username"`
	Password string `gorm:"type:varchar(255);" json:"password"`
}

func (session *Session) BeforeCreate(_ *gorm.DB) (err error) {
	session.ID = uuid.New()

	return
}

func (credentials *SessionCredentials) BeforeCreate(_ *gorm.DB) (err error) {
	credentials.ID = uuid.New()

	return
}
