package models

import (
	"time"

	"gorm.io/gorm"
)

type BlogPost struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Content
	Title   string `gorm:"not null;size:200;index" json:"title"`
	Slug    string `gorm:"uniqueIndex;not null;size:250" json:"slug"`
	Content string `gorm:"type:text;not null" json:"content"`
	
	// Content format
	ContentType string `gorm:"size:20;default:'markdown'" json:"content_type"` // "markdown" or "html"
	
	// SEO and metadata
	Excerpt     string `gorm:"size:500" json:"excerpt"`
	MetaTitle   string `gorm:"size:200" json:"meta_title"`
	MetaDesc    string `gorm:"size:300" json:"meta_description"`
	
	// Publishing
	IsPublished bool       `gorm:"default:false;index" json:"is_published"`
	PublishedAt *time.Time `gorm:"index" json:"published_at,omitempty"`
	IsFeatured  bool       `gorm:"default:false;index" json:"is_featured"`
	
	// Tags (stored as JSON array)
	Tags []string `gorm:"type:jsonb" json:"tags"`
	
	// Statistics
	ViewCount int `gorm:"default:0" json:"view_count"`
	
	// Foreign keys
	AuthorID *uint `gorm:"index" json:"author_id,omitempty"`
	
	// Relationships
	Author *User `gorm:"foreignKey:AuthorID;constraint:OnDelete:SET NULL" json:"author,omitempty"`
}

// BlogPostInput represents the input structure for creating/updating blog posts
type BlogPostInput struct {
	Title       string   `json:"title" binding:"required,max=200"`
	Content     string   `json:"content" binding:"required"`
	ContentType string   `json:"content_type"`
	Excerpt     string   `json:"excerpt"`
	MetaTitle   string   `json:"meta_title"`
	MetaDesc    string   `json:"meta_description"`
	IsPublished bool     `json:"is_published"`
	IsFeatured  bool     `json:"is_featured"`
	Tags        []string `json:"tags"`
}