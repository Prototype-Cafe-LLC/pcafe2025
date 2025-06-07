package seeds

import (
	"fmt"
	"log"
	"time"

	"github.com/pcafe/pcafe2025/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedDevelopmentData seeds the database with development data
func SeedDevelopmentData(db *gorm.DB) error {
	log.Println("Starting development data seeding...")

	// Seed admin user
	if err := seedAdminUser(db); err != nil {
		return fmt.Errorf("failed to seed admin user: %w", err)
	}

	// Seed sample blog posts
	if err := seedBlogPosts(db); err != nil {
		return fmt.Errorf("failed to seed blog posts: %w", err)
	}

	// Seed sample events
	if err := seedEvents(db); err != nil {
		return fmt.Errorf("failed to seed events: %w", err)
	}

	// Seed sample contact submissions
	if err := seedContactSubmissions(db); err != nil {
		return fmt.Errorf("failed to seed contact submissions: %w", err)
	}

	// Seed sample IoT data
	if err := seedIoTData(db); err != nil {
		return fmt.Errorf("failed to seed IoT data: %w", err)
	}

	log.Println("Development data seeding completed successfully")
	return nil
}

func seedAdminUser(db *gorm.DB) error {
	// Check if admin user already exists
	var existingUser models.User
	if err := db.Where("username = ?", "admin").First(&existingUser).Error; err == nil {
		log.Println("Admin user already exists, skipping...")
		return nil
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	admin := models.User{
		Username: "admin",
		Email:    "admin@pcafe.example.com",
		Password: string(hashedPassword),
		IsAdmin:  true,
	}

	if err := db.Create(&admin).Error; err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	log.Printf("Created admin user (ID: %d)", admin.ID)
	return nil
}

func seedBlogPosts(db *gorm.DB) error {
	// Get admin user for author
	var admin models.User
	if err := db.Where("username = ?", "admin").First(&admin).Error; err != nil {
		return fmt.Errorf("admin user not found: %w", err)
	}

	blogPosts := []models.BlogPost{
		{
			Title:       "PCafe 2025 リニューアルのお知らせ",
			Slug:        "pcafe-2025-renewal-announcement",
			Content:     "# PCafe 2025 リニューアル\n\nPCafeのWebサイトが新しくなりました。Go + React構成でより高速で使いやすくなっています。\n\n## 新機能\n\n- リアルタイムIoTデータ表示\n- 改善されたイベントカレンダー\n- レスポンシブデザイン",
			ContentType: "markdown",
			Excerpt:     "PCafeのWebサイトがリニューアルしました。新機能とともにご紹介します。",
			MetaTitle:   "PCafe 2025 リニューアルのお知らせ",
			MetaDesc:    "PCafeのWebサイトが新しくなりました。Go + React構成でより高速で使いやすくなっています。",
			IsPublished: true,
			PublishedAt: timePtr(time.Now().Add(-24 * time.Hour)),
			IsFeatured:  true,
			Tags:        []string{"お知らせ", "リニューアル", "技術"},
			ViewCount:   156,
			AuthorID:    &admin.ID,
		},
		{
			Title:       "IoTセンサーデータの可視化について",
			Slug:        "iot-sensor-data-visualization",
			Content:     "# IoTデータ可視化システム\n\nPCafeでは、50M+のIoTセンサーデータをTimescaleDBで管理し、リアルタイムで可視化しています。\n\n## 技術スタック\n\n- **Database**: PostgreSQL + TimescaleDB\n- **Visualization**: D3.js, Chart.js\n- **Backend**: Go + GORM",
			ContentType: "markdown",
			Excerpt:     "IoTセンサーデータの収集と可視化システムについて解説します。",
			IsPublished: true,
			PublishedAt: timePtr(time.Now().Add(-48 * time.Hour)),
			IsFeatured:  false,
			Tags:        []string{"IoT", "データ可視化", "TimescaleDB"},
			ViewCount:   89,
			AuthorID:    &admin.ID,
		},
		{
			Title:       "スマートビルディングの未来",
			Slug:        "future-of-smart-buildings",
			Content:     "# スマートビルディングの未来\n\nIoT技術の進歩により、ビルディング管理は大きく変わろうとしています。\n\n## 期待される変化\n\n- エネルギー効率の向上\n- 予防保全の自動化\n- 快適性の向上",
			ContentType: "markdown",
			Excerpt:     "IoT技術がもたらすスマートビルディングの可能性について考察します。",
			IsPublished: false,
			IsFeatured:  false,
			Tags:        []string{"スマートビルディング", "IoT", "未来技術"},
			ViewCount:   12,
			AuthorID:    &admin.ID,
		},
	}

	for _, post := range blogPosts {
		var existing models.BlogPost
		if err := db.Where("slug = ?", post.Slug).First(&existing).Error; err != nil {
			if err := db.Create(&post).Error; err != nil {
				return fmt.Errorf("failed to create blog post %s: %w", post.Title, err)
			}
			log.Printf("Created blog post: %s", post.Title)
		}
	}

	return nil
}

func seedEvents(db *gorm.DB) error {
	// Get admin user for creator
	var admin models.User
	if err := db.Where("username = ?", "admin").First(&admin).Error; err != nil {
		return fmt.Errorf("admin user not found: %w", err)
	}

	events := []models.Event{
		{
			Title:         "IoT勉強会 #25",
			Description:   "今月のIoT勉強会では、TimescaleDBを使った時系列データの効率的な処理について学びます。",
			EventURL:      "https://example.com/iot-study-25",
			ImageURL:      "https://example.com/images/iot-study.jpg",
			StartDate:     time.Now().Add(7 * 24 * time.Hour),
			EndDate:       timePtr(time.Now().Add(7*24*time.Hour + 2*time.Hour)),
			IsAllDay:      false,
			OrganizerName: "PCafe",
			OrganizerURL:  "https://pcafe.example.com",
			SourceURL:     "https://connpass.com/event/example",
			SourceType:    "url",
			IsPublished:   true,
			IsFeatured:    true,
			CreatedByID:   &admin.ID,
		},
		{
			Title:         "スマートシティ見学ツアー",
			Description:   "最新のスマートシティ技術を実際に見学できるツアーです。IoT、5G、AIが融合した未来の街を体験しましょう。",
			EventURL:      "https://example.com/smart-city-tour",
			StartDate:     time.Now().Add(14 * 24 * time.Hour),
			EndDate:       timePtr(time.Now().Add(14*24*time.Hour + 4*time.Hour)),
			IsAllDay:      false,
			OrganizerName: "スマートシティ推進協議会",
			OrganizerURL:  "https://smart-city.example.org",
			SourceURL:     "https://peatix.com/event/example",
			SourceType:    "url",
			IsPublished:   true,
			IsFeatured:    false,
			CreatedByID:   &admin.ID,
		},
		{
			Title:         "PCafe 施設見学",
			Description:   "PCafeの施設をご見学いただけます。IoTセンサーシステムや設備について詳しくご説明します。",
			EventURL:      "",
			StartDate:     time.Now().Add(21 * 24 * time.Hour),
			IsAllDay:      true,
			OrganizerName: "PCafe",
			SourceType:    "manual",
			IsPublished:   true,
			IsFeatured:    false,
			CreatedByID:   &admin.ID,
		},
	}

	for _, event := range events {
		var existing models.Event
		if err := db.Where("title = ? AND start_date = ?", event.Title, event.StartDate).First(&existing).Error; err != nil {
			if err := db.Create(&event).Error; err != nil {
				return fmt.Errorf("failed to create event %s: %w", event.Title, err)
			}
			log.Printf("Created event: %s", event.Title)
		}
	}

	return nil
}

func seedContactSubmissions(db *gorm.DB) error {
	submissions := []models.ContactSubmission{
		{
			Name:              "田中太郎",
			Email:             "tanaka@example.com",
			Phone:             "090-1234-5678",
			Company:           "株式会社Example",
			Subject:           "施設見学のお申し込み",
			Message:           "PCafeの施設見学を希望いたします。来週の火曜日はご都合いかがでしょうか。",
			FormType:          "tour_request",
			Source:            "/contact",
			IPAddress:         "192.168.1.100",
			UserAgent:         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
			TurnstileVerified: true,
			Status:            "new",
			IsSpam:            false,
		},
		{
			Name:              "佐藤花子",
			Email:             "sato@techcorp.jp",
			Phone:             "03-1234-5678",
			Company:           "テックコープ株式会社",
			Subject:           "パートナーシップについて",
			Message:           "弊社のIoTソリューションとPCafeの技術を組み合わせたパートナーシップの可能性について相談させていただきたく。",
			FormType:          "partnership",
			Source:            "/contact",
			IPAddress:         "203.0.113.50",
			UserAgent:         "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			TurnstileVerified: true,
			Status:            "read",
			IsSpam:            false,
			ProcessedAt:       timePtr(time.Now().Add(-12 * time.Hour)),
			AdminNotes:        "興味深い提案。来週ミーティングを設定する。",
		},
	}

	for _, submission := range submissions {
		var existing models.ContactSubmission
		if err := db.Where("email = ? AND subject = ?", submission.Email, submission.Subject).First(&existing).Error; err != nil {
			if err := db.Create(&submission).Error; err != nil {
				return fmt.Errorf("failed to create contact submission from %s: %w", submission.Email, err)
			}
			log.Printf("Created contact submission from: %s", submission.Email)
		}
	}

	return nil
}

func seedIoTData(db *gorm.DB) error {
	log.Println("Seeding IoT data (this may take a moment)...")

	// Seed data for the last 7 days
	startTime := time.Now().Add(-7 * 24 * time.Hour)
	endTime := time.Now()

	devices := []struct {
		ID       string
		Name     string
		Type     string
		Location string
		Sensors  []struct {
			Type string
			Unit string
		}
	}{
		{
			ID:       "temp-001",
			Name:     "Temperature Sensor 1F",
			Type:     "temperature",
			Location: "1階ロビー",
			Sensors: []struct {
				Type string
				Unit string
			}{
				{"temperature", "°C"},
				{"humidity", "%"},
			},
		},
		{
			ID:       "temp-002",
			Name:     "Temperature Sensor 2F",
			Type:     "temperature",
			Location: "2階オフィス",
			Sensors: []struct {
				Type string
				Unit string
			}{
				{"temperature", "°C"},
				{"humidity", "%"},
			},
		},
		{
			ID:       "power-001",
			Name:     "Power Meter Main",
			Type:     "power",
			Location: "電気室",
			Sensors: []struct {
				Type string
				Unit string
			}{
				{"power_consumption", "kWh"},
				{"voltage", "V"},
				{"current", "A"},
			},
		},
	}

	// Generate data points every 5 minutes
	interval := 5 * time.Minute
	var iotData []models.IoTData

	for current := startTime; current.Before(endTime); current = current.Add(interval) {
		for _, device := range devices {
			for _, sensor := range device.Sensors {
				var value float64
				var quality string = "good"

				// Generate realistic values based on sensor type
				switch sensor.Type {
				case "temperature":
					value = 20.0 + 5.0*timeBasedVariation(current) // 15-25°C
				case "humidity":
					value = 50.0 + 20.0*timeBasedVariation(current) // 30-70%
				case "power_consumption":
					value = 1000.0 + 500.0*timeBasedVariation(current) // 500-1500 kWh
				case "voltage":
					value = 220.0 + 10.0*timeBasedVariation(current) // 210-230V
				case "current":
					value = 10.0 + 5.0*timeBasedVariation(current) // 5-15A
				}

				// Simulate occasional bad quality data (5% chance)
				if timeBasedVariation(current) > 0.95 {
					quality = "warning"
					value *= 1.5 // Simulate sensor drift
				}

				iotData = append(iotData, models.IoTData{
					Time:       current,
					DeviceID:   device.ID,
					DeviceName: device.Name,
					DeviceType: device.Type,
					Location:   device.Location,
					SensorType: sensor.Type,
					Value:      value,
					Unit:       sensor.Unit,
					Quality:    quality,
					Accuracy:   0.98,
				})
			}
		}
	}

	// Batch insert for better performance
	batchSize := 1000
	for i := 0; i < len(iotData); i += batchSize {
		end := i + batchSize
		if end > len(iotData) {
			end = len(iotData)
		}

		if err := db.Create(iotData[i:end]).Error; err != nil {
			return fmt.Errorf("failed to insert IoT data batch: %w", err)
		}
	}

	log.Printf("Created %d IoT data points", len(iotData))
	return nil
}

// timeBasedVariation generates a pseudo-random value between 0 and 1 based on time
func timeBasedVariation(t time.Time) float64 {
	// Use a simple hash function based on time for consistent "randomness"
	hash := float64((t.Unix() * 31) % 1000000)
	return hash / 1000000.0
}

// timePtr is a helper function to create time pointers
func timePtr(t time.Time) *time.Time {
	return &t
}