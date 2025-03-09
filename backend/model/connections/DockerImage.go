package connections

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DockerImage struct {
	gorm.Model
	ID                             uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	Port                           uint16    `gorm:"not null" json:"port"`
	Image                          string    `gorm:"type:varchar(255);not null;" json:"image"`
	ImageTag                       string    `gorm:"type:varchar(255);not null;" json:"imageTag"`
	ContainerRunOptions            string    `gorm:"type:varchar(255);" json:"containerRunOptions"`
	ContainerRunArgs               string    `gorm:"type:varchar(255);" json:"containerRunArgs"`
	DeleteContainerAfterDisconnect bool      `gorm:"default:false" json:"deleteContainerAfterDisconnect"`
}

func (dockerImage *DockerImage) BeforeCreate(_ *gorm.DB) (err error) {
	dockerImage.ID = uuid.New()

	return
}
