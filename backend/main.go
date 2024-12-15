package main

import (
	"flag"
	"fmt"
	"github.com/gofiber/fiber/v2"
	fiberLogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"net"
	"os"
	"vnc/database"
	"vnc/vnc"
)

var logger = logrus.New()

func main() {
	var socketPath string

	err := godotenv.Load("backend.env")
	if err != nil {
		panic("Error loading .env file")
	}

	vnc.Init()
	database.Connect()

	app := fiber.New()

	createAPIs(app)

	app.Use(fiberLogger.New())

	switch envMode := os.Getenv("ENV_MODE"); envMode {
	case "dev":
		app.Get("/", func(c *fiber.Ctx) error {
			return c.SendString("Hello, World!")
		})

		err = app.Listen(":3001")

		if err != nil {
			fmt.Println(err)
			return
		}

		break
	case "prod":
		flag.StringVar(&socketPath, "socket", "/run/guest-services/backend.sock", "Unix domain socket to listen on")
		flag.Parse()

		_ = os.RemoveAll(socketPath)

		logger.SetOutput(os.Stdout)
		logger.Infof("Starting listening on %s\n", socketPath)

		ln, err := listen(socketPath)
		if err != nil {
			logger.Fatal(err)
		}
		err = app.Listener(ln)

		if err != nil {
			fmt.Println(err)
			return
		}

		break
	}
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}
