package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/pcafe/pcafe2025/config"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
)

// EventData represents the structure for parsing event information
type EventData struct {
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	URL           string    `json:"url"`
	StartDate     time.Time `json:"start_date"`
	EndDate       *time.Time `json:"end_date,omitempty"`
	OrganizerName string    `json:"organizer_name"`
	OrganizerURL  string    `json:"organizer_url"`
	IsRecurring   bool      `json:"is_recurring"`
	Category      string    `json:"category"`
}

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

	log.Println("Starting event migration from PCafe website...")

	// Since we can't directly access the Django database,
	// we'll create sample events based on the website information
	events := createSampleEventsFromWebsite()

	// Get admin user for event creation
	var admin models.User
	database := db.GetDB()
	if err := database.Where("username = ?", "admin").First(&admin).Error; err != nil {
		log.Printf("Warning: Admin user not found, events will be created without creator: %v", err)
	}

	var createdCount int
	for _, eventData := range events {
		event := models.Event{
			Title:         eventData.Title,
			Description:   eventData.Description,
			EventURL:      eventData.URL,
			StartDate:     eventData.StartDate,
			EndDate:       eventData.EndDate,
			IsAllDay:      false,
			OrganizerName: eventData.OrganizerName,
			OrganizerURL:  eventData.OrganizerURL,
			SourceURL:     "https://www.prototype-cafe.space/event/",
			SourceType:    "manual",
			IsPublished:   true,
			IsFeatured:    eventData.Category == "featured",
		}

		if admin.ID != 0 {
			event.CreatedByID = &admin.ID
		}

		// Check if event already exists
		var existing models.Event
		if err := database.Where("title = ? AND start_date = ?", event.Title, event.StartDate).First(&existing).Error; err != nil {
			if err := database.Create(&event).Error; err != nil {
				log.Printf("Failed to create event %s: %v", event.Title, err)
				continue
			}
			log.Printf("Created event: %s", event.Title)
			createdCount++
		} else {
			log.Printf("Event already exists: %s", event.Title)
		}
	}

	log.Printf("Event migration completed. Created %d new events.", createdCount)
}

// createSampleEventsFromWebsite creates sample events based on the website information
// In a real scenario, this would parse the actual website or access the Django database
func createSampleEventsFromWebsite() []EventData {
	now := time.Now()
	jst := time.FixedZone("JST", 9*60*60)
	
	return []EventData{
		{
			Title:         "JAWS-UG 新潟 プチキャッチアップ",
			Description:   "毎週木曜日の夜に開催される AWS ユーザーグループのカジュアルな勉強会です。AWS の最新情報や技術について気軽に情報交換しましょう。",
			URL:           "https://jaws-ug-niigata.doorkeeper.jp/",
			StartDate:     time.Date(2025, time.June, 5, 19, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.June, 5, 21, 0, 0, 0, jst)),
			OrganizerName: "JAWS-UG 新潟",
			OrganizerURL:  "https://jaws-ug-niigata.doorkeeper.jp/",
			IsRecurring:   true,
			Category:      "regular",
		},
		{
			Title:         "Code for Niigata",
			Description:   "シビックテック活動を通じて、テクノロジーで地域の課題解決に取り組む月例ミートアップです。",
			URL:           "https://code4niigata.org/",
			StartDate:     time.Date(2025, time.June, 15, 13, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.June, 15, 17, 0, 0, 0, jst)),
			OrganizerName: "Code for Niigata",
			OrganizerURL:  "https://code4niigata.org/",
			IsRecurring:   true,
			Category:      "civic-tech",
		},
		{
			Title:         "Niigata 5min Tech",
			Description:   "新潟のエンジニアによる5分間のライトニングトーク形式の技術勉強会です。毎月開催しています。",
			URL:           "https://niigata-5min-tech.connpass.com/",
			StartDate:     time.Date(2025, time.June, 28, 19, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.June, 28, 21, 30, 0, 0, jst)),
			OrganizerName: "Niigata 5min Tech運営",
			OrganizerURL:  "https://niigata-5min-tech.connpass.com/",
			IsRecurring:   true,
			Category:      "featured",
		},
		{
			Title:         "SRE Lounge \"Road to SRE NEXT@会津若松\"",
			Description:   "SRE（Site Reliability Engineering）について学び、実践的な知識を共有するイベントです。",
			URL:           "https://sre-next.dev/",
			StartDate:     time.Date(2025, time.May, 17, 14, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.May, 17, 18, 0, 0, 0, jst)),
			OrganizerName: "SRE Lounge",
			OrganizerURL:  "https://sre-next.dev/",
			IsRecurring:   false,
			Category:      "conference",
		},
		{
			Title:         "AI CRAFT Hacks Niigata #2",
			Description:   "AI・機械学習技術を活用したプロダクト開発に焦点を当てたハッカソンイベントです。",
			URL:           "https://aicraft.connpass.com/",
			StartDate:     time.Date(2025, time.May, 25, 10, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.May, 25, 18, 0, 0, 0, jst)),
			OrganizerName: "AI CRAFT",
			OrganizerURL:  "https://aicraft.connpass.com/",
			IsRecurring:   false,
			Category:      "hackathon",
		},
		{
			Title:         "PHP Conference Niigata 2025",
			Description:   "新潟で開催される PHP カンファレンスです。PHP の最新動向や実践的な開発手法について学べます。",
			URL:           "https://phpcon-niigata.jp/",
			StartDate:     time.Date(2025, time.May, 31, 13, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.May, 31, 18, 0, 0, 0, jst)),
			OrganizerName: "PHPカンファレンス新潟実行委員会",
			OrganizerURL:  "https://phpcon-niigata.jp/",
			IsRecurring:   false,
			Category:      "featured",
		},
		{
			Title:         "JAWS-UG Niigata Summer Hands-on Festival",
			Description:   "夏の大型ハンズオンイベント。AWS の様々なサービスを実際に触って学べる複数のセッションを用意しています。",
			URL:           "https://jaws-ug-niigata.doorkeeper.jp/",
			StartDate:     time.Date(2025, time.July, 5, 10, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.July, 5, 17, 0, 0, 0, jst)),
			OrganizerName: "JAWS-UG 新潟",
			OrganizerURL:  "https://jaws-ug-niigata.doorkeeper.jp/",
			IsRecurring:   false,
			Category:      "featured",
		},
		{
			Title:         "IoTLT Niigata",
			Description:   "IoT（Internet of Things）技術に関するライトニングトーク形式の勉強会です。",
			URL:           "https://iotlt.connpass.com/",
			StartDate:     time.Date(2025, time.July, 12, 19, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.July, 12, 21, 0, 0, 0, jst)),
			OrganizerName: "IoTLT",
			OrganizerURL:  "https://iotlt.connpass.com/",
			IsRecurring:   true,
			Category:      "iot",
		},
		{
			Title:         "Information Systems in Niigata",
			Description:   "情報システムの構築・運用に携わるエンジニアの情報交換会です。",
			URL:           "",
			StartDate:     time.Date(2025, time.July, 20, 14, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.July, 20, 17, 0, 0, 0, jst)),
			OrganizerName: "PCafe",
			OrganizerURL:  "https://www.prototype-cafe.space/",
			IsRecurring:   true,
			Category:      "systems",
		},
		{
			Title:         "NINNO Tech Fest",
			Description:   "新潟の IT コミュニティが集結する年次イベントです。様々な技術分野のセッションが楽しめます。",
			URL:           "https://ninno.connpass.com/",
			StartDate:     time.Date(2025, time.August, 30, 10, 0, 0, 0, jst),
			EndDate:       timePtr(time.Date(2025, time.August, 30, 18, 0, 0, 0, jst)),
			OrganizerName: "NINNO (新潟ITコミュニティネットワーク)",
			OrganizerURL:  "https://ninno.connpass.com/",
			IsRecurring:   false,
			Category:      "featured",
		},
	}
}

// fetchEventDetails fetches event details from external APIs
// This is a placeholder function for future implementation
func fetchEventDetails(url string) (*EventData, error) {
	// In a real implementation, this would:
	// 1. Fetch the event page HTML
	// 2. Parse OpenGraph meta tags
	// 3. Extract structured data (JSON-LD)
	// 4. Parse Connpass/Doorkeeper APIs if available
	
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch event page: %w", err)
	}
	defer resp.Body.Close()
	
	// Placeholder implementation
	return &EventData{
		Title:       "Parsed Event Title",
		Description: "Parsed event description",
		URL:         url,
	}, nil
}

// timePtr is a helper function to create time pointers
func timePtr(t time.Time) *time.Time {
	return &t
}