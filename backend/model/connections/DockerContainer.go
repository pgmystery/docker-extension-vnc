package connections

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DockerContainer struct {
	gorm.Model
	ID                  uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	Container           string    `gorm:"type:varchar(255);not null;" json:"container"`
	Port                uint      `gorm:"not null;" json:"port"`
	StopAfterDisconnect bool      `gorm:"default:false;" json:"stopAfterDisconnect"`
}

func (dockerContainer *DockerContainer) BeforeCreate(_ *gorm.DB) (err error) {
	dockerContainer.ID = uuid.New()

	return
}
