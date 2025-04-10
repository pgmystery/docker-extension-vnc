package main

import (
	"github.com/gofiber/fiber/v2"
	APIRoutes "vnc/routes"
)

func createAPIs(app *fiber.App) {
	apiRouter := app.Group("/api")

	APIRoutes.SettingsRouter(apiRouter)
	APIRoutes.SessionRouter(apiRouter)
	APIRoutes.DockerHubRouter(apiRouter)
}
