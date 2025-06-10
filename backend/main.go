package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/config"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/db/seeds"
	"github.com/pcafe/pcafe2025/handlers"
	"github.com/pcafe/pcafe2025/middleware"
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
	authHandler := handlers.NewAuthHandler()
	blogHandler := handlers.NewBlogHandler()
	eventHandler := handlers.NewEventHandler()
	iotHandler := handlers.NewIoTHandler()

	// Setup router
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		// Allow requests from frontend development server and production
		allowedOrigins := []string{"http://localhost:3000", "http://localhost:5173", "https://pcafe2025.com"}

		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Expose-Headers", "Content-Range")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API routes
	api := router.Group("/api")
	{
		// Authentication endpoints
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/me", middleware.RequireAuth(), authHandler.GetCurrentUser)
			auth.POST("/refresh", middleware.RequireAuth(), authHandler.RefreshSession)
		}

		// Blog endpoints
		blog := api.Group("/blog")
		{
			blog.GET("", middleware.OptionalAuth(), blogHandler.GetBlogPosts)
			blog.GET("/tags", blogHandler.GetBlogTags)
			blog.GET("/:id", middleware.OptionalAuth(), blogHandler.GetBlogPost)
			blog.POST("", middleware.RequireAdminAuth(), blogHandler.CreateBlogPost)
			blog.PUT("/:id", middleware.RequireAdminAuth(), blogHandler.UpdateBlogPost)
			blog.DELETE("/:id", middleware.RequireAdminAuth(), blogHandler.DeleteBlogPost)
		}

		// Event endpoints
		events := api.Group("/events")
		{
			events.GET("", middleware.OptionalAuth(), eventHandler.GetEvents)
			events.GET("/calendar", eventHandler.GetEventCalendar)
			events.GET("/:id", middleware.OptionalAuth(), eventHandler.GetEvent)
			events.POST("", middleware.RequireAdminAuth(), eventHandler.CreateEvent)
			events.PUT("/:id", middleware.RequireAdminAuth(), eventHandler.UpdateEvent)
			events.DELETE("/:id", middleware.RequireAdminAuth(), eventHandler.DeleteEvent)
			events.POST("/extract-metadata", middleware.RequireAdminAuth(), eventHandler.ExtractMetadata)
			events.POST("/process-image", middleware.RequireAdminAuth(), eventHandler.ProcessImageOCR)
			events.POST("/process-pdf", middleware.RequireAdminAuth(), eventHandler.ProcessPDFExtraction)
		}

		// IoT data endpoints
		iot := api.Group("/iot")
		{
			iot.GET("/data", iotHandler.GetIoTData)
			iot.GET("/stats", iotHandler.GetIoTStats)
			iot.GET("/latest", iotHandler.GetLatestIoTData)
			iot.GET("/devices", iotHandler.GetDevices)
			iot.GET("/chart-data", iotHandler.GetChartData)
			iot.POST("/data", middleware.RequireAdminAuth(), iotHandler.CreateIoTData)
			iot.POST("/sample-data", middleware.RequireAdminAuth(), iotHandler.PopulateSampleData)
			iot.DELETE("/sample-data", middleware.RequireAdminAuth(), iotHandler.ClearSampleData)
		}

		// Office data endpoints (Django compatibility)
		api.GET("/officedata", handlers.GetOfficeDataList)
		api.POST("/officedata", handlers.CreateOfficeData)
		api.GET("/officedata/:time", handlers.GetOfficeDataByID)
		api.GET("/latest", handlers.GetLatestOfficeData)

		// Contact form endpoints
		api.POST("/contact", contactHandler.SubmitContactForm)
		api.GET("/contact", middleware.RequireAdminAuth(), contactHandler.GetContactSubmissions)
		api.PUT("/contact/:id", middleware.RequireAdminAuth(), contactHandler.UpdateContactSubmission)
	}

	// Django compatibility endpoints
	router.GET("/jlist", handlers.GetOfficeDataJSON)
	router.GET("/jlast", handlers.GetLastOfficeData)

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "PCafe 2025 Backend"})
	})
	
	// Debug route to list all registered routes
	router.GET("/debug/routes", func(c *gin.Context) {
		routes := router.Routes()
		routeList := make([]gin.H, len(routes))
		for i, route := range routes {
			routeList[i] = gin.H{
				"method": route.Method,
				"path":   route.Path,
			}
		}
		c.JSON(200, gin.H{
			"total_routes": len(routes),
			"routes":       routeList,
		})
	})

	// Start server
	addr := cfg.ServerHost + ":" + cfg.ServerPort
	log.Printf("Starting PCafe 2025 server on %s", addr)
	log.Printf("Environment: %s", cfg.Env)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
