package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	Username string `gorm:"uniqueIndex;not null;size:50" json:"username"`
	Email    string `gorm:"uniqueIndex;not null;size:100" json:"email"`
	Password string `gorm:"not null;size:255" json:"-"`
	IsAdmin  bool   `gorm:"default:false" json:"is_admin"`

	// Sessions for this user
	Sessions []Session `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"sessions,omitempty"`

	// Blog posts created by this user
	BlogPosts []BlogPost `gorm:"foreignKey:AuthorID;constraint:OnDelete:SET NULL" json:"blog_posts,omitempty"`

	// Events created by this user
	Events []Event `gorm:"foreignKey:CreatedByID;constraint:OnDelete:SET NULL" json:"events,omitempty"`
}
