package main

import (
	"log"
	"os"

	"github.com/pcafe/pcafe2025/config"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/db/seeds"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	if err := db.InitDatabase(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer func() {
		if err := db.CloseDB(); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}()

	// Seed development data if in development mode and seed flag is provided
	if cfg.Env == "development" && len(os.Args) > 1 && os.Args[1] == "seed" {
		log.Println("Seeding development data...")
		if err := seeds.SeedDevelopmentData(db.GetDB()); err != nil {
			log.Fatalf("Failed to seed development data: %v", err)
		}
		log.Println("Development data seeded successfully")
		return
	}

	log.Printf("PCafe 2025 database setup completed successfully!")
	log.Printf("Database: %s@%s:%s/%s", cfg.DBUser, cfg.DBHost, cfg.DBPort, cfg.DBName)
	log.Printf("Environment: %s", cfg.Env)
}