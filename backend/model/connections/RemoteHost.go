package connections

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RemoteHost struct {
	gorm.Model
	ID        uuid.UUID `gorm:"type:uuid;primary_key;"`
	Type      string    `gorm:"type:varchar(255);default:remote;->;" json:"type"`
	Host      string    `gorm:"type:varchar(255);" json:"host"`
	Port      string    `gorm:"type:varchar(255);" json:"port"`
	SessionId uuid.UUID `gorm:"type:uuid;"`
}

func (remoteHost *RemoteHost) BeforeCreate(_ *gorm.DB) (err error) {
	// UUID version 4
	remoteHost.ID = uuid.New()

	return
}
