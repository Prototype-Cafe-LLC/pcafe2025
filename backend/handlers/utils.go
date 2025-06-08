package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/models"
)

// getUserFromContext safely extracts user from gin context
func getUserFromContext(c *gin.Context) (*models.User, bool) {
	user, exists := c.Get("user")
	if !exists {
		return nil, false
	}
	
	if u, ok := user.(models.User); ok {
		return &u, true
	} else if u, ok := user.(*models.User); ok {
		return u, true
	}
	
	return nil, false
}