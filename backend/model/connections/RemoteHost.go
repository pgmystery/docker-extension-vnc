package connections

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RemoteHost struct {
	gorm.Model
	ID   uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	Host string    `gorm:"type:varchar(255);" json:"host"`
	Port uint      `json:"port"`
}

func (remoteHost *RemoteHost) BeforeCreate(_ *gorm.DB) (err error) {
	remoteHost.ID = uuid.New()

	return
}
