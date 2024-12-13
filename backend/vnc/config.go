package vnc

import (
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	DataPath string `env:"VNC_DATA_PATH" envDefault:"data"`
	FileName string `env:"VNC_SETTINGS_NAME" envDefault:"vnc_settings"`
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
