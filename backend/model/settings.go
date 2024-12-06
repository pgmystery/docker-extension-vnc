package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Settings struct {
	gorm.Model
	ID               uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	QualityLevel     uint      `json:"qualityLevel"`
	CompressionLevel uint      `json:"compressionLevel"`
	ShowDotCursor    bool      `json:"showDotCursor"`
	ViewOnlyMode     bool      `json:"viewOnlyMode"`
}

func (settings *Settings) BeforeCreate(_ *gorm.DB) (err error) {
	settings.ID = uuid.New()

	return
}
