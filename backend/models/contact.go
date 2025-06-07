package models

import (
	"time"

	"gorm.io/gorm"
)

type ContactSubmission struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Contact information
	Name    string `gorm:"not null;size:100" json:"name"`
	Email   string `gorm:"not null;size:100;index" json:"email"`
	Phone   string `gorm:"size:20" json:"phone"`
	Company string `gorm:"size:100" json:"company"`

	// Message content
	Subject string `gorm:"not null;size:200" json:"subject"`
	Message string `gorm:"type:text;not null" json:"message"`

	// Form metadata
	FormType  string `gorm:"size:50;default:'general'" json:"form_type"` // "general", "tour_request", "partnership"
	Source    string `gorm:"size:100" json:"source"`                     // referring page/source
	IPAddress string `gorm:"size:45" json:"ip_address"`
	UserAgent string `gorm:"size:500" json:"user_agent"`

	// Turnstile verification
	TurnstileToken    string `gorm:"size:1000" json:"-"` // Don't expose in JSON
	TurnstileVerified bool   `gorm:"default:false;index" json:"turnstile_verified"`

	// Status tracking
	Status      string     `gorm:"size:20;default:'new';index" json:"status"` // "new", "read", "responded", "closed"
	IsSpam      bool       `gorm:"default:false;index" json:"is_spam"`
	ProcessedAt *time.Time `gorm:"index" json:"processed_at,omitempty"`

	// Admin notes
	AdminNotes string `gorm:"type:text" json:"admin_notes,omitempty"`

	// Response tracking
	ResponseSent   bool       `gorm:"default:false" json:"response_sent"`
	ResponseSentAt *time.Time `json:"response_sent_at,omitempty"`
}

// ContactSubmissionInput represents the input structure for contact form submissions
type ContactSubmissionInput struct {
	Name           string `json:"name" binding:"required,max=100"`
	Email          string `json:"email" binding:"required,email,max=100"`
	Phone          string `json:"phone" binding:"max=20"`
	Company        string `json:"company" binding:"max=100"`
	Subject        string `json:"subject" binding:"required,max=200"`
	Message        string `json:"message" binding:"required,max=2000"`
	FormType       string `json:"form_type"`
	TurnstileToken string `json:"turnstile_token" binding:"required"`
}

// ContactSubmissionUpdate represents the input structure for updating contact submissions (admin only)
type ContactSubmissionUpdate struct {
	Status       string `json:"status" binding:"oneof=new read responded closed"`
	IsSpam       bool   `json:"is_spam"`
	AdminNotes   string `json:"admin_notes"`
	ResponseSent bool   `json:"response_sent"`
}
