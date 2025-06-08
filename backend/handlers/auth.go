package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler handles authentication operations
type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// LoginInput represents the login request structure
type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login handles POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by username
	var user models.User
	database := db.GetDB()

	if err := database.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if user is admin
	if !user.IsAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	// Generate session ID
	sessionBytes := make([]byte, 32)
	if _, err := rand.Read(sessionBytes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate session"})
		return
	}
	sessionID := hex.EncodeToString(sessionBytes)

	// Create session
	session := models.Session{
		SessionID: sessionID,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(24 * time.Hour), // 24 hour session
		IPAddress: c.ClientIP(),
		UserAgent: c.GetHeader("User-Agent"),
	}

	if err := database.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Set cookie
	c.SetCookie("session_id", sessionID, 24*3600, "/", "", false, true) // httpOnly=true

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"is_admin": user.IsAdmin,
		},
	})
}

// Logout handles POST /api/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Already logged out"})
		return
	}

	// Delete session from database
	database := db.GetDB()
	database.Where("session_id = ?", sessionID).Delete(&models.Session{})

	// Clear cookie
	c.SetCookie("session_id", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}

// GetCurrentUser handles GET /api/auth/me
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	// Debug: First check if user exists in context
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated - no user in context"})
		return
	}
	
	// Debug: Check the type of user
	switch user := userInterface.(type) {
	case *models.User:
		// It's a pointer to User
		c.JSON(http.StatusOK, gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"is_admin": user.IsAdmin,
		})
	case models.User:
		// It's a User value
		c.JSON(http.StatusOK, gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"is_admin": user.IsAdmin,
		})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Invalid user type in context",
			"type":  fmt.Sprintf("%T", userInterface),
		})
	}
}

// RefreshSession handles POST /api/auth/refresh
func (h *AuthHandler) RefreshSession(c *gin.Context) {
	sessionValue, exists := c.Get("session")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	session := sessionValue.(*models.Session)
	database := db.GetDB()

	// Extend session expiration
	session.ExpiresAt = time.Now().Add(24 * time.Hour)
	if err := database.Save(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to refresh session"})
		return
	}

	// Update cookie
	c.SetCookie("session_id", session.SessionID, 24*3600, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Session refreshed successfully"})
}
