package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
	"github.com/pcafe/pcafe2025/services"
)

// BlogHandler handles blog operations
type BlogHandler struct {
	contentService *services.ContentService
}

func NewBlogHandler() *BlogHandler {
	return &BlogHandler{
		contentService: services.NewContentService(),
	}
}

// generateSlug creates a URL-friendly slug from title
func generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Simple slug generation - in production, use a proper slug library
	return slug
}

// GetBlogPosts handles GET /api/blog
// @Summary List blog posts
// @Description Get a list of blog posts with optional filters
// @Tags Blog
// @Produce json
// @Param featured query bool false "Filter by featured posts"
// @Param tag query string false "Filter by tag"
// @Param search query string false "Search in title, content, and excerpt"
// @Param limit query int false "Number of posts to return (max 100)"
// @Param offset query int false "Number of posts to skip"
// @Success 200 {array} models.BlogPost "List of blog posts"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /blog [get]
func (h *BlogHandler) GetBlogPosts(c *gin.Context) {
	var posts []models.BlogPost
	database := db.GetDB()

	// Build query
	query := database.Preload("Author").Order("created_at DESC")

	// Filter by published status for non-admin users
	user, userExists := getUserFromContext(c)
	if !userExists || !user.IsAdmin {
		query = query.Where("is_published = ?", true)
	}

	// Apply filters
	if featured := c.Query("featured"); featured == "true" {
		query = query.Where("is_featured = ?", true)
	}

	if tag := c.Query("tag"); tag != "" {
		query = query.Where("tags @> ?", `["`+tag+`"]`)
	}

	// Search functionality
	if search := c.Query("search"); search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(excerpt) LIKE ?",
			searchTerm, searchTerm, searchTerm,
		)
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

	// Get total count for pagination
	var total int64
	countQuery := database.Model(&models.BlogPost{})

	// Apply same filters for count (same user permission logic)
	if !userExists || !user.IsAdmin {
		countQuery = countQuery.Where("is_published = ?", true)
	}

	if featured := c.Query("featured"); featured == "true" {
		countQuery = countQuery.Where("is_featured = ?", true)
	}

	if tag := c.Query("tag"); tag != "" {
		countQuery = countQuery.Where("tags @> ?", `["`+tag+`"]`)
	}

	if search := c.Query("search"); search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		countQuery = countQuery.Where(
			"LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(excerpt) LIKE ?",
			searchTerm, searchTerm, searchTerm,
		)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	query = query.Limit(limit).Offset(offset)

	if err := query.Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response format with processed content
	responses := make([]models.BlogPostResponse, len(posts))
	for i, post := range posts {
		responses[i] = h.convertToResponse(post, false) // Skip heavy processing for listing
	}

	// Set Content-Range header for React Admin pagination
	contentRange := fmt.Sprintf("posts %d-%d/%d", offset, offset+len(responses)-1, total)
	c.Header("Content-Range", contentRange)

	// Format response for React Admin simple REST provider
	c.JSON(http.StatusOK, gin.H{
		"data":  responses,
		"total": total,
	})
}

// GetBlogPost handles GET /api/blog/:id
// @Summary Get a blog post
// @Description Get a blog post by ID or slug
// @Tags Blog
// @Produce json
// @Param id path string true "Blog post ID or slug"
// @Success 200 {object} models.BlogPost "Blog post details"
// @Failure 404 {object} map[string]string "Blog post not found"
// @Router /blog/{id} [get]
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
	user, userExists := getUserFromContext(c)
	if !userExists || !user.IsAdmin {
		if !post.IsPublished {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
			return
		}
	}

	// Increment view count
	database.Model(&post).UpdateColumn("view_count", post.ViewCount+1)

	// Convert to response format with full processing
	response := h.convertToResponse(post, true)
	c.JSON(http.StatusOK, response)
}

// CreateBlogPost handles POST /api/blog (admin only)
// @Summary Create a blog post
// @Description Create a new blog post (admin only)
// @Tags Blog
// @Accept json
// @Produce json
// @Security SessionAuth
// @Param input body models.BlogPostInput true "Blog post data"
// @Success 201 {object} models.BlogPost "Created blog post"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /blog [post]
func (h *BlogHandler) CreateBlogPost(c *gin.Context) {
	var input models.BlogPostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, exists := getUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	// Validate content type
	if input.ContentType == "" {
		input.ContentType = "markdown"
	}
	if !h.contentService.ValidateContentType(input.ContentType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content type. Supported types: markdown, html"})
		return
	}

	// Generate excerpt if not provided
	if input.Excerpt == "" {
		excerpt, err := h.contentService.GenerateExcerpt(input.Content, input.ContentType, 200)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate excerpt"})
			return
		}
		input.Excerpt = excerpt
	}

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

	// Convert to response format
	response := h.convertToResponse(post, true)
	c.JSON(http.StatusCreated, response)
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

	// Validate content type
	if input.ContentType == "" {
		input.ContentType = "markdown"
	}
	if !h.contentService.ValidateContentType(input.ContentType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content type. Supported types: markdown, html"})
		return
	}

	// Generate excerpt if not provided and content changed
	if input.Excerpt == "" || input.Content != post.Content {
		excerpt, err := h.contentService.GenerateExcerpt(input.Content, input.ContentType, 200)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate excerpt"})
			return
		}
		input.Excerpt = excerpt
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

	// Convert to response format
	response := h.convertToResponse(post, true)
	c.JSON(http.StatusOK, response)
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

// GetBlogTags handles GET /api/blog/tags
func (h *BlogHandler) GetBlogTags(c *gin.Context) {
	var tags []string
	database := db.GetDB()

	// Query to get all unique tags from published posts
	query := `
		SELECT DISTINCT jsonb_array_elements_text(tags) as tag 
		FROM blog_posts 
		WHERE is_published = true AND deleted_at IS NULL
		ORDER BY tag
	`

	rows, err := database.Raw(query).Rows()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			continue
		}
		tags = append(tags, tag)
	}

	c.JSON(http.StatusOK, gin.H{"tags": tags})
}

// convertToResponse converts BlogPost to BlogPostResponse with processed content
func (h *BlogHandler) convertToResponse(post models.BlogPost, includeProcessedContent bool) models.BlogPostResponse {
	response := models.BlogPostResponse{
		BlogPost: post,
	}

	if includeProcessedContent {
		// Process content for full rendering
		processedContent, err := h.contentService.ProcessContent(post.Content, post.ContentType)
		if err == nil {
			response.ProcessedContent = processedContent
		}

		// Extract plain text for search indexing
		plainText, err := h.contentService.ExtractPlainText(post.Content, post.ContentType)
		if err == nil {
			response.PlainText = plainText
			// Calculate reading time (average 200 words per minute)
			wordCount := len(strings.Fields(plainText))
			response.ReadingTime = max(1, wordCount/200)
		}
	} else {
		// For listing, just provide a simple excerpt
		response.ProcessedContent = post.Excerpt
		response.ReadingTime = 1 // Default for listing
	}

	return response
}

// max helper function
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
