package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/config"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/db/seeds"
	"github.com/pcafe/pcafe2025/handlers"
	"github.com/pcafe/pcafe2025/services"
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

	// Handle command line arguments
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "seed":
			log.Println("Seeding development data...")
			if err := seeds.SeedDevelopmentData(db.GetDB()); err != nil {
				log.Fatalf("Failed to seed development data: %v", err)
			}
			log.Println("Development data seeded successfully")
			return
		case "migrate":
			log.Printf("PCafe 2025 database migrations completed successfully!")
			log.Printf("Database: %s@%s:%s/%s", cfg.DBUser, cfg.DBHost, cfg.DBPort, cfg.DBName)
			log.Printf("Environment: %s", cfg.Env)
			return
		}
	}

	// Start web server
	startServer(cfg)
}

func startServer(cfg *config.Config) {
	// Initialize services
	emailService := services.NewEmailService(
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPUsername,
		cfg.SMTPPassword,
		cfg.FromEmail,
	)

	turnstileService := services.NewTurnstileService(cfg.TurnstileSecretKey)

	// Initialize handlers
	contactHandler := handlers.NewContactHandler(emailService, turnstileService)

	// Setup router
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API routes
	api := router.Group("/api")
	{
		// Office data endpoints (Django compatibility)
		api.GET("/officedata", handlers.GetOfficeDataList)
		api.POST("/officedata", handlers.CreateOfficeData)
		api.GET("/officedata/:time", handlers.GetOfficeDataByID)
		api.GET("/latest", handlers.GetLatestOfficeData)

		// Contact form endpoints
		api.POST("/contact", contactHandler.SubmitContactForm)
		api.GET("/contact", contactHandler.GetContactSubmissions)    // Admin only
		api.PUT("/contact/:id", contactHandler.UpdateContactSubmission) // Admin only
	}

	// Django compatibility endpoints
	router.GET("/jlist", handlers.GetOfficeDataJSON)
	router.GET("/jlast", handlers.GetLastOfficeData)

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "PCafe 2025 Backend"})
	})

	// Start server
	addr := cfg.ServerHost + ":" + cfg.ServerPort
	log.Printf("Starting PCafe 2025 server on %s", addr)
	log.Printf("Environment: %s", cfg.Env)
	
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}