package database

import (
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type ConfigDB struct {
	Host     string `envPrefix:"DB_" env:"HOST" envDefault:"localhost"`
	Port     int    `envPrefix:"DB_" env:"PORT" envDefault:"3306"`
	Name     string `envPrefix:"DB_" env:"NAME" envDefault:"vnc"`
	User     string `envPrefix:"DB_" env:"USER" envDefault:"vnc"`
	Password string `envPrefix:"DB_" env:"PASSWORD" envDefault:"vnc"`
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
