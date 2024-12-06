package crud

import (
	"vnc/database"
	"vnc/model"
)

func GetSettings() model.Settings {
	db := database.DB
	var settings model.Settings

	db.First(&settings)

	return settings
}
