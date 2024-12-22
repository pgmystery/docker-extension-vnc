package vnc

import (
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	DataPath              string `env:"VNC_DATA_PATH" envDefault:"data"`
	SettingsFileName      string `env:"VNC_SETTINGS_NAME" envDefault:"vnc_settings"`
	ActiveSessionFileName string `env:"VNC_ACTIVE_SESSION_FILE_NAME" envDefault:"vnc_active_session"`
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
