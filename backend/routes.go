package main

import (
	APIRoutes "vnc/routes"

	"github.com/gofiber/fiber/v2"
)

func createAPIs(app *fiber.App) {
	apiRouter := app.Group("/api")

	APIRoutes.SettingsRouter(apiRouter)
	APIRoutes.SessionRouter(apiRouter)
	APIRoutes.DockerHubRouter(apiRouter)
}
