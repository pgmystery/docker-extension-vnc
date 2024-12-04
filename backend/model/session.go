package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Session struct {
	gorm.Model
	Id          uuid.UUID           `gorm:"type:uuid;primary_key;" json:"id"`
	Name        string              `gorm:"type:varchar(255);unique;" json:"name"`
	Credentials *SessionCredentials `gorm:"default:null" json:"credentials,omitempty"`
	Connection  uuid.UUID           `gorm:"type:uuid;" json:"connection"`
}

type SessionCredentials struct {
	gorm.Model
	ID        uuid.UUID `gorm:"type:uuid;primary_key;"`
	Username  string    `gorm:"type:varchar(255);" json:"username"`
	Password  string    `gorm:"type:varchar(255);" json:"password"`
	SessionId uuid.UUID `gorm:"type:uuid;"`
}

func (session *Session) BeforeCreate(_ *gorm.DB) (err error) {
	// UUID version 4
	session.Id = uuid.New()

	return
}

func (credentials *SessionCredentials) BeforeCreate(_ *gorm.DB) (err error) {
	// UUID version 4
	credentials.ID = uuid.New()

	return
}
