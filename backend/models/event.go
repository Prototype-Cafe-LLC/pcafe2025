package models

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Event details
	Title       string `gorm:"not null;size:200" json:"title"`
	Description string `gorm:"type:text" json:"description"`
	EventURL    string `gorm:"size:500" json:"event_url"`
	ImageURL    string `gorm:"size:500" json:"image_url"`

	// Date and time
	StartDate time.Time  `gorm:"not null;index" json:"start_date"`
	EndDate   *time.Time `gorm:"index" json:"end_date,omitempty"`
	IsAllDay  bool       `gorm:"default:false" json:"is_all_day"`

	// Organizer information
	OrganizerName string `gorm:"size:100" json:"organizer_name"`
	OrganizerURL  string `gorm:"size:500" json:"organizer_url"`

	// Metadata extraction info
	SourceURL     string  `gorm:"size:500" json:"source_url"`
	SourceType    string  `gorm:"size:50" json:"source_type"` // "url", "image", "pdf"
	ExtractedData *string `gorm:"type:jsonb" json:"extracted_data,omitempty"`

	// Status and visibility
	IsPublished bool `gorm:"default:true;index" json:"is_published"`
	IsFeatured  bool `gorm:"default:false;index" json:"is_featured"`

	// Foreign keys
	CreatedByID *uint `gorm:"index" json:"created_by_id,omitempty"`

	// Relationships
	CreatedBy *User `gorm:"foreignKey:CreatedByID;constraint:OnDelete:SET NULL" json:"created_by,omitempty"`
}

// EventInput represents the input structure for creating/updating events
type EventInput struct {
	Title         string     `json:"title" binding:"required,max=200"`
	Description   string     `json:"description"`
	EventURL      string     `json:"event_url"`
	ImageURL      string     `json:"image_url"`
	StartDate     time.Time  `json:"start_date" binding:"required"`
	EndDate       *time.Time `json:"end_date,omitempty"`
	IsAllDay      bool       `json:"is_all_day"`
	OrganizerName string     `json:"organizer_name"`
	OrganizerURL  string     `json:"organizer_url"`
	SourceURL     string     `json:"source_url"`
	SourceType    string     `json:"source_type"`
	IsPublished   bool       `json:"is_published"`
	IsFeatured    bool       `json:"is_featured"`
}
