package database

import (
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type ConfigDB struct {
	Host     string `env:"DB_HOST" envDefault:"localhost"`
	Port     int    `env:"DB_PORT" envDefault:"5432"`
	Name     string `env:"DB_NAME" envDefault:"vnc"`
	User     string `env:"DB_USER" envDefault:"vnc"`
	Password string `env:"DB_PASSWORD" envDefault:"vnc"`
}

func loadConfig() (*ConfigDB, error) {
	err := godotenv.Load("backend.env")
	if err != nil {
		return nil, err
	}

	configDB := ConfigDB{}
	err = env.Parse(&configDB)
	if err != nil {
		return nil, err
	}

	return &configDB, nil
}
