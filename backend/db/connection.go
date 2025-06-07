package db

import (
	"fmt"
	"log"
	"time"

	"github.com/pcafe/pcafe2025/config"
	"github.com/pcafe/pcafe2025/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase initializes the database connection and runs migrations
func InitDatabase(config *config.Config) error {
	var err error

	// Construct PostgreSQL DSN
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Tokyo",
		config.DBHost,
		config.DBUser,
		config.DBPassword,
		config.DBName,
		config.DBPort,
		config.DBSSLMode,
	)

	// Configure GORM logger based on environment
	var gormLogger logger.Interface
	if config.Env == "development" {
		gormLogger = logger.Default.LogMode(logger.Info)
	} else {
		gormLogger = logger.Default.LogMode(logger.Warn)
	}

	// Connect to database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connection established successfully")

	// Enable TimescaleDB extension if not already enabled
	if err := enableTimescaleDB(); err != nil {
		log.Printf("Warning: Failed to enable TimescaleDB extension: %v", err)
	}

	// Run migrations
	if err := runMigrations(); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Setup TimescaleDB hypertables for IoT data
	if err := setupTimescaleHypertables(); err != nil {
		return fmt.Errorf("failed to setup TimescaleDB hypertables: %w", err)
	}

	log.Println("Database initialization completed successfully")
	return nil
}

// enableTimescaleDB enables the TimescaleDB extension
func enableTimescaleDB() error {
	result := DB.Exec("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;")
	if result.Error != nil {
		return fmt.Errorf("failed to enable TimescaleDB extension: %w", result.Error)
	}
	log.Println("TimescaleDB extension enabled")
	return nil
}

// runMigrations runs all database migrations
func runMigrations() error {
	// Run standard table migrations first
	err := DB.AutoMigrate(
		&models.User{},
		&models.Session{},
		&models.Event{},
		&models.BlogPost{},
		&models.ContactSubmission{},
		&models.OfficeData{}, // Django OfficeData compatibility table
		&models.IoTData{},    // Extended IoT data table
	)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate models: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// setupTimescaleHypertables converts the tables to TimescaleDB hypertables
func setupTimescaleHypertables() error {
	// Setup OfficeData hypertable (Django compatibility)
	if err := setupOfficeDataHypertable(); err != nil {
		return fmt.Errorf("failed to setup office_data hypertable: %w", err)
	}

	// Setup IoTData hypertable (future expansion)
	if err := setupIoTDataHypertable(); err != nil {
		return fmt.Errorf("failed to setup iot_data hypertable: %w", err)
	}

	return nil
}

// setupOfficeDataHypertable converts the office_data table to a TimescaleDB hypertable
func setupOfficeDataHypertable() error {
	// Check if hypertable already exists
	var exists bool
	err := DB.Raw(`
		SELECT EXISTS (
			SELECT 1 FROM timescaledb_information.hypertables 
			WHERE hypertable_name = 'office_data'
		)
	`).Scan(&exists).Error

	if err != nil {
		return fmt.Errorf("failed to check if office_data hypertable exists: %w", err)
	}

	if !exists {
		// Convert table to hypertable partitioned by time
		err = DB.Exec(`
			SELECT create_hypertable('office_data', 'time', 
				chunk_time_interval => INTERVAL '1 day',
				if_not_exists => TRUE
			);
		`).Error
		if err != nil {
			return fmt.Errorf("failed to create office_data hypertable: %w", err)
		}
		log.Println("Office data hypertable created successfully")

		// Create indexes for office data
		err = createOfficeDataIndexes()
		if err != nil {
			return fmt.Errorf("failed to create office data indexes: %w", err)
		}
	} else {
		log.Println("Office data hypertable already exists")
	}

	return nil
}

// setupIoTDataHypertable converts the iot_data table to a TimescaleDB hypertable
func setupIoTDataHypertable() error {
	// Check if hypertable already exists
	var exists bool
	err := DB.Raw(`
		SELECT EXISTS (
			SELECT 1 FROM timescaledb_information.hypertables 
			WHERE hypertable_name = 'iot_data'
		)
	`).Scan(&exists).Error

	if err != nil {
		return fmt.Errorf("failed to check if iot_data hypertable exists: %w", err)
	}

	if !exists {
		// Convert table to hypertable partitioned by time
		err = DB.Exec(`
			SELECT create_hypertable('iot_data', 'time', 
				chunk_time_interval => INTERVAL '1 day',
				if_not_exists => TRUE
			);
		`).Error
		if err != nil {
			return fmt.Errorf("failed to create iot_data hypertable: %w", err)
		}
		log.Println("IoT data hypertable created successfully")

		// Create additional indexes for optimal performance
		err = createTimescaleIndexes()
		if err != nil {
			return fmt.Errorf("failed to create TimescaleDB indexes: %w", err)
		}
	} else {
		log.Println("IoT data hypertable already exists")
	}

	return nil
}

// createOfficeDataIndexes creates optimized indexes for office data
func createOfficeDataIndexes() error {
	indexes := []string{
		// Time-based indexes for efficient querying
		"CREATE INDEX IF NOT EXISTS idx_office_time ON office_data (time DESC);",
		"CREATE INDEX IF NOT EXISTS idx_office_time_brin ON office_data USING BRIN (time);",

		// Composite indexes for common query patterns
		"CREATE INDEX IF NOT EXISTS idx_office_event_time ON office_data (event_title, time DESC) WHERE event_title != '';",
		"CREATE INDEX IF NOT EXISTS idx_office_open_time ON office_data (office_open, time DESC);",
		"CREATE INDEX IF NOT EXISTS idx_office_light_time ON office_data (light, time DESC);",

		// Indexes for environmental data queries
		"CREATE INDEX IF NOT EXISTS idx_office_temperature ON office_data (temperature) WHERE temperature > 0;",
		"CREATE INDEX IF NOT EXISTS idx_office_co2 ON office_data (co2) WHERE co2 > 0;",
	}

	for _, indexSQL := range indexes {
		err := DB.Exec(indexSQL).Error
		if err != nil {
			return fmt.Errorf("failed to create office data index: %s, error: %w", indexSQL, err)
		}
	}

	log.Println("Office data indexes created successfully")
	return nil
}

// createTimescaleIndexes creates optimized indexes for TimescaleDB
func createTimescaleIndexes() error {
	indexes := []string{
		// Composite indexes for common query patterns
		"CREATE INDEX IF NOT EXISTS idx_iot_device_time ON iot_data (device_id, time DESC);",
		"CREATE INDEX IF NOT EXISTS idx_iot_sensor_time ON iot_data (sensor_type, time DESC);",
		"CREATE INDEX IF NOT EXISTS idx_iot_location_time ON iot_data (location, time DESC);",
		"CREATE INDEX IF NOT EXISTS idx_iot_device_sensor_time ON iot_data (device_id, sensor_type, time DESC);",

		// Index for value range queries
		"CREATE INDEX IF NOT EXISTS idx_iot_value ON iot_data (value) WHERE quality = 'good';",

		// BRIN index for time column (very efficient for time-series data)
		"CREATE INDEX IF NOT EXISTS idx_iot_time_brin ON iot_data USING BRIN (time);",
	}

	for _, indexSQL := range indexes {
		err := DB.Exec(indexSQL).Error
		if err != nil {
			return fmt.Errorf("failed to create index: %s, error: %w", indexSQL, err)
		}
	}

	log.Println("TimescaleDB indexes created successfully")
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// CloseDB closes the database connection
func CloseDB() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
