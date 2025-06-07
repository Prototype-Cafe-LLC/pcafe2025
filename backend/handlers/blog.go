package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
)

// BlogHandler handles blog operations
type BlogHandler struct{}

func NewBlogHandler() *BlogHandler {
	return &BlogHandler{}
}

// generateSlug creates a URL-friendly slug from title
func generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Simple slug generation - in production, use a proper slug library
	return slug
}

// GetBlogPosts handles GET /api/blog
func (h *BlogHandler) GetBlogPosts(c *gin.Context) {
	var posts []models.BlogPost
	database := db.GetDB()

	// Build query
	query := database.Preload("Author").Order("created_at DESC")

	// Filter by published status for non-admin users
	user, userExists := c.Get("user")
	if !userExists || !user.(*models.User).IsAdmin {
		query = query.Where("is_published = ?", true)
	}

	// Apply filters
	if featured := c.Query("featured"); featured == "true" {
		query = query.Where("is_featured = ?", true)
	}

	if tag := c.Query("tag"); tag != "" {
		query = query.Where("tags @> ?", `["`+tag+`"]`)
	}

	// Pagination
	limit := 20
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := 0
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	query = query.Limit(limit).Offset(offset)

	if err := query.Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

// GetBlogPost handles GET /api/blog/:id
func (h *BlogHandler) GetBlogPost(c *gin.Context) {
	id := c.Param("id")

	var post models.BlogPost
	database := db.GetDB()

	query := database.Preload("Author")

	// Check if ID is numeric or slug
	if _, err := strconv.Atoi(id); err == nil {
		query = query.Where("id = ?", id)
	} else {
		query = query.Where("slug = ?", id)
	}

	if err := query.First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
		return
	}

	// Check if published for non-admin users
	user, userExists := c.Get("user")
	if !userExists || !user.(*models.User).IsAdmin {
		if !post.IsPublished {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
			return
		}
	}

	// Increment view count
	database.Model(&post).UpdateColumn("view_count", post.ViewCount+1)

	c.JSON(http.StatusOK, post)
}

// CreateBlogPost handles POST /api/blog (admin only)
func (h *BlogHandler) CreateBlogPost(c *gin.Context) {
	var input models.BlogPostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := c.MustGet("user").(*models.User)

	// Generate slug if not provided
	slug := generateSlug(input.Title)

	// Ensure slug is unique
	database := db.GetDB()
	var count int64
	database.Model(&models.BlogPost{}).Where("slug = ?", slug).Count(&count)
	if count > 0 {
		slug = slug + "-" + strconv.FormatInt(time.Now().Unix(), 10)
	}

	post := models.BlogPost{
		Title:       input.Title,
		Slug:        slug,
		Content:     input.Content,
		ContentType: input.ContentType,
		Excerpt:     input.Excerpt,
		MetaTitle:   input.MetaTitle,
		MetaDesc:    input.MetaDesc,
		IsPublished: input.IsPublished,
		IsFeatured:  input.IsFeatured,
		Tags:        input.Tags,
		AuthorID:    &user.ID,
	}

	if input.IsPublished {
		now := time.Now()
		post.PublishedAt = &now
	}

	if err := database.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Load the created post with author
	database.Preload("Author").First(&post, post.ID)

	c.JSON(http.StatusCreated, post)
}

// UpdateBlogPost handles PUT /api/blog/:id (admin only)
func (h *BlogHandler) UpdateBlogPost(c *gin.Context) {
	id := c.Param("id")

	var input models.BlogPostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var post models.BlogPost
	database := db.GetDB()

	if err := database.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
		return
	}

	// Update fields
	post.Title = input.Title
	post.Content = input.Content
	post.ContentType = input.ContentType
	post.Excerpt = input.Excerpt
	post.MetaTitle = input.MetaTitle
	post.MetaDesc = input.MetaDesc
	post.IsFeatured = input.IsFeatured
	post.Tags = input.Tags

	// Handle publishing status change
	if input.IsPublished && !post.IsPublished {
		now := time.Now()
		post.PublishedAt = &now
	} else if !input.IsPublished {
		post.PublishedAt = nil
	}
	post.IsPublished = input.IsPublished

	if err := database.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Load the updated post with author
	database.Preload("Author").First(&post, post.ID)

	c.JSON(http.StatusOK, post)
}

// DeleteBlogPost handles DELETE /api/blog/:id (admin only)
func (h *BlogHandler) DeleteBlogPost(c *gin.Context) {
	id := c.Param("id")

	var post models.BlogPost
	database := db.GetDB()

	if err := database.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
		return
	}

	if err := database.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog post deleted successfully"})
}
