package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"vnc/crud"
)

func SettingsRouter(apiRouter fiber.Router) {
	settingsRouter := apiRouter.Group("/settings")

	settingsRouter.Get("/", getSettings)
}

func getSettings(ctx *fiber.Ctx) error {
	settings := crud.GetSettings()

	if settings.ID == uuid.Nil {
		return ctx.SendStatus(404)
	}

	return ctx.JSON(settings)
}
