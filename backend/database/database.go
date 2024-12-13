package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
	"os"
	"path/filepath"
	"vnc/model"
	"vnc/model/connections"
)

type DbInstance struct {
	Db *gorm.DB
}

var DB *gorm.DB

func Connect() {
	config, err := loadConfig()
	if err != nil {
		panic(err)
	}

	dataPath := filepath.Join(".", config.DataPath)
	err = os.MkdirAll(dataPath, os.ModePerm)
	if err != nil {
		panic(err)
	}

	databaseFilePath := filepath.Join(dataPath, config.Name+".db")

	db, err := gorm.Open(sqlite.Open(databaseFilePath), &gorm.Config{
		//Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		panic(err)
	}

	log.Println("[DATABASE]: Connected")
	log.Println("[DATABASE]: running migrations")

	err = db.AutoMigrate(&model.Session{})
	if err != nil {
		panic(err)
	}

	err = db.AutoMigrate(&model.SessionCredentials{})
	if err != nil {
		panic(err)
	}

	err = db.AutoMigrate(&connections.RemoteHost{})
	if err != nil {
		panic(err)
	}

	err = db.AutoMigrate(&connections.DockerContainer{})
	if err != nil {
		panic(err)
	}

	DB = db
}
