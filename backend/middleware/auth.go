package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
)

// RequireAuth middleware checks for valid session-based authentication
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get session ID from cookie
		sessionID, err := c.Cookie("session_id")
		if err != nil || sessionID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		// Validate session in database
		var session models.Session
		database := db.GetDB()

		if err := database.Preload("User").Where("session_id = ? AND expires_at > NOW()", sessionID).First(&session).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
			c.Abort()
			return
		}

		// Store user in context for handlers to use
		c.Set("user", &session.User)
		c.Set("session", session)
		c.Next()
	}
}

// RequireAdminAuth middleware requires both authentication and admin privileges
func RequireAdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get session ID from cookie
		sessionID, err := c.Cookie("session_id")
		if err != nil || sessionID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		// Validate session in database
		var session models.Session
		database := db.GetDB()

		if err := database.Preload("User").Where("session_id = ? AND expires_at > NOW()", sessionID).First(&session).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
			c.Abort()
			return
		}

		// Check if user is admin
		if !session.User.IsAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		// Store user in context for handlers to use
		c.Set("user", &session.User)
		c.Set("session", session)
		c.Next()
	}
}

// OptionalAuth middleware provides user context if authenticated but doesn't require it
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID, err := c.Cookie("session_id")
		if err != nil || sessionID == "" {
			c.Next()
			return
		}

		var session models.Session
		database := db.GetDB()

		if err := database.Preload("User").Where("session_id = ? AND expires_at > NOW()", sessionID).First(&session).Error; err != nil {
			c.Next()
			return
		}

		c.Set("user", &session.User)
		c.Set("session", session)
		c.Next()
	}
}
