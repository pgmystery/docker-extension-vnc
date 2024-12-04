package connections

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DockerContainer struct {
	gorm.Model
	ID          uuid.UUID `gorm:"type:uuid;primary_key;"`
	Type        string    `gorm:"type:varchar(255);default:docker;->;" json:"type"`
	ContainerId string    `gorm:"type:varchar(255);" json:"containerId"`
	Port        string    `gorm:"type:varchar(255);" json:"port"`
}

func (dockerContainer *DockerContainer) BeforeCreate(_ *gorm.DB) (err error) {
	// UUID version 4
	dockerContainer.ID = uuid.New()

	return
}
