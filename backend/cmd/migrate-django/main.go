package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/pcafe/pcafe2025/config"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// DjangoOfficeData represents the Django OfficeData model structure
type DjangoOfficeData struct {
	ID           int       `db:"id"`
	Time         time.Time `db:"time"`
	Temperature  float64   `db:"temperature"`
	CO2          int       `db:"co2"`
	Ambient      int       `db:"ambient"`
	EventTitle   string    `db:"event_title"`
	Light        bool      `db:"light"`
	OfficeOpen   bool      `db:"office_open"`
	ParkingSlot1 bool      `db:"parking_slot1"`
	ParkingSlot2 bool      `db:"parking_slot2"`
}

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Usage: go run cmd/migrate_django.go <django_db_dsn>")
	}

	djangoDSN := os.Args[1]

	// Load configuration for new database
	cfg := config.LoadConfig()

	// Initialize new database
	if err := db.InitDatabase(cfg); err != nil {
		log.Fatalf("Failed to initialize new database: %v", err)
	}
	defer func() {
		if err := db.CloseDB(); err != nil {
			log.Printf("Error closing new database: %v", err)
		}
	}()

	// Connect to Django database
	djangoDB, err := sql.Open("postgres", djangoDSN)
	if err != nil {
		log.Fatalf("Failed to connect to Django database: %v", err)
	}
	defer djangoDB.Close()

	// Test Django database connection
	if err := djangoDB.Ping(); err != nil {
		log.Fatalf("Failed to ping Django database: %v", err)
	}

	log.Println("Connected to Django database successfully")

	// Migrate OfficeData
	if err := migrateOfficeData(djangoDB); err != nil {
		log.Fatalf("Failed to migrate office data: %v", err)
	}

	log.Println("Migration completed successfully!")
}

func migrateOfficeData(djangoDB *sql.DB) error {
	log.Println("Starting OfficeData migration...")

	// Query Django OfficeData
	query := `
		SELECT id, time, temperature, co2, ambient, event_title, 
		       light, office_open, parking_slot1, parking_slot2
		FROM monitor_officedata 
		ORDER BY time ASC
	`

	rows, err := djangoDB.Query(query)
	if err != nil {
		return fmt.Errorf("failed to query Django OfficeData: %w", err)
	}
	defer rows.Close()

	newDB := db.GetDB()
	var totalCount int
	var batchSize = 1000
	var batch []models.OfficeData

	for rows.Next() {
		var djangoData DjangoOfficeData
		err := rows.Scan(
			&djangoData.ID,
			&djangoData.Time,
			&djangoData.Temperature,
			&djangoData.CO2,
			&djangoData.Ambient,
			&djangoData.EventTitle,
			&djangoData.Light,
			&djangoData.OfficeOpen,
			&djangoData.ParkingSlot1,
			&djangoData.ParkingSlot2,
		)
		if err != nil {
			return fmt.Errorf("failed to scan Django OfficeData row: %w", err)
		}

		// Convert to new OfficeData model
		newData := models.OfficeData{
			Time:         djangoData.Time,
			Temperature:  djangoData.Temperature,
			CO2:          djangoData.CO2,
			Ambient:      djangoData.Ambient,
			EventTitle:   djangoData.EventTitle,
			Light:        djangoData.Light,
			OfficeOpen:   djangoData.OfficeOpen,
			ParkingSlot1: djangoData.ParkingSlot1,
			ParkingSlot2: djangoData.ParkingSlot2,
		}

		batch = append(batch, newData)
		totalCount++

		// Insert batch when it reaches batch size
		if len(batch) >= batchSize {
			if err := insertBatch(newDB, batch); err != nil {
				return fmt.Errorf("failed to insert batch at record %d: %w", totalCount, err)
			}
			log.Printf("Migrated %d records...", totalCount)
			batch = batch[:0] // Clear batch
		}
	}

	// Insert remaining records
	if len(batch) > 0 {
		if err := insertBatch(newDB, batch); err != nil {
			return fmt.Errorf("failed to insert final batch: %w", err)
		}
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("error iterating Django OfficeData rows: %w", err)
	}

	log.Printf("Successfully migrated %d OfficeData records", totalCount)
	return nil
}

func insertBatch(newDB *gorm.DB, batch []models.OfficeData) error {
	// Use ON CONFLICT to handle duplicates (based on time as primary key)
	return newDB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "time"}},
		DoNothing: true,
	}).Create(&batch).Error
}

// Additional migration functions can be added here for other models
// func migrateEvents(djangoDB *sql.DB) error { ... }
// func migrateBlogPosts(djangoDB *sql.DB) error { ... }
