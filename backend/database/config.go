package database

import (
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	DataPath string `env:"VNC_DATA_PATH" envDefault:"data"`
	Name     string `env:"VNC_DB_NAME" envDefault:"vnc"`
}

func loadConfig() (*Config, error) {
	err := godotenv.Load("backend.env")
	if err != nil {
		return nil, err
	}

	config := Config{}
	err = env.Parse(&config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}
