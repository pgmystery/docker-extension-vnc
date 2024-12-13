package routes

import (
	"github.com/gofiber/fiber/v2"
	"vnc/vnc"
)

func SettingsRouter(apiRouter fiber.Router) {
	settingsRouter := apiRouter.Group("/settings")

	settingsRouter.Get("/", getSettings)
	settingsRouter.Post("/", setSettings)
}

func getSettings(ctx *fiber.Ctx) error {
	return ctx.Status(200).JSON(vnc.Settings.Data)
}

func setSettings(ctx *fiber.Ctx) error {
	var vncSettingsData vnc.SettingsData

	if err := ctx.BodyParser(&vncSettingsData); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := vnc.Settings.Save(vncSettingsData); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.SendStatus(200)
}
