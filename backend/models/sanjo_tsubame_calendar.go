package models

import (
	"time"

	"gorm.io/gorm"
)

// SanjoTsubameCalendar represents business day/holiday status data for Sanjo-Tsubame region
// This maintains compatibility with the original Django implementation
type SanjoTsubameCalendar struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Date and status
	Year   int    `gorm:"not null;index:idx_sanjo_date" json:"year"`
	Month  int    `gorm:"not null;index:idx_sanjo_date" json:"month"`
	Day    int    `gorm:"not null;index:idx_sanjo_date" json:"day"`
	Status string `gorm:"type:varchar(20);not null" json:"status"` // "on", "off", "undefined"

	// Admin metadata
	CreatedByID uint   `json:"created_by_id"`
	Notes       string `gorm:"type:text" json:"notes,omitempty"`

	// Relationships
	CreatedBy User `gorm:"foreignKey:CreatedByID" json:"created_by,omitempty"`
}

// TableName specifies the table name for GORM
func (SanjoTsubameCalendar) TableName() string {
	return "sanjo_tsubame_calendars"
}

// SanjoTsubameCalendarInput represents input for creating/updating calendar status
type SanjoTsubameCalendarInput struct {
	Year   int    `json:"year" binding:"required,min=2018,max=2030"`
	Month  int    `json:"month" binding:"required,min=1,max=12"`
	Day    int    `json:"day" binding:"required,min=1,max=31"`
	Status string `json:"status" binding:"required,oneof=on off undefined"`
	Notes  string `json:"notes"`
}

// SanjoTsubameStatusResponse represents the response for date status queries
type SanjoTsubameStatusResponse struct {
	Year   int    `json:"year"`
	Month  int    `json:"month"`
	Date   int    `json:"date"`
	Status string `json:"status"`
}

// SanjoTsubameBulkImportRequest represents a request to import multiple calendar entries
type SanjoTsubameBulkImportRequest struct {
	Year   int     `json:"year" binding:"required,min=2018,max=2030"`
	Month  int     `json:"month" binding:"required,min=1,max=12"`
	Days   []int   `json:"days" binding:"required"`
	Status string  `json:"status" binding:"required,oneof=on off"`
}