package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
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

	//dsn := fmt.Sprintf("host=%s port=%d dbname=%s user=%s password=%s sslmode=disable TimeZone=Asia/Shanghai",
	//	config.Host,
	//	config.Port,
	//	config.Name,
	//	config.User,
	//	config.Password,
	//)
	//db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
	db, err := gorm.Open(sqlite.Open(config.Name+".db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		panic(err)
	}

	log.Println("[DATABASE]: Connected")
	db.Logger = logger.Default.LogMode(logger.Info)
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
