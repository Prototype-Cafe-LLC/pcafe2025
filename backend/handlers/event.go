package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
	"github.com/pcafe/pcafe2025/services"
)

// EventHandler handles event operations
type EventHandler struct{}

func NewEventHandler() *EventHandler {
	return &EventHandler{}
}

// GetEvents handles GET /api/events
func (h *EventHandler) GetEvents(c *gin.Context) {
	var events []models.Event
	database := db.GetDB()

	// Build query
	query := database.Preload("CreatedBy").Order("start_date ASC")

	// Filter by published status for non-admin users
	user, userExists := getUserFromContext(c)
	if !userExists || !user.IsAdmin {
		query = query.Where("is_published = ?", true)
		// Hide past events for public users (optional)
		if c.Query("include_past") != "true" {
			query = query.Where("start_date >= ?", time.Now())
		}
	}

	// Apply filters
	if featured := c.Query("featured"); featured == "true" {
		query = query.Where("is_featured = ?", true)
	}

	if startDate := c.Query("start_date"); startDate != "" {
		if date, err := time.Parse("2006-01-02", startDate); err == nil {
			query = query.Where("start_date >= ?", date)
		}
	}

	if endDate := c.Query("end_date"); endDate != "" {
		if date, err := time.Parse("2006-01-02", endDate); err == nil {
			query = query.Where("start_date <= ?", date)
		}
	}

	// Count total records for pagination
	var total int64
	countQuery := database.Model(&models.Event{})
	if !userExists || !user.IsAdmin {
		countQuery = countQuery.Where("is_published = ?", true)
		if c.Query("include_past") != "true" {
			countQuery = countQuery.Where("start_date >= ?", time.Now())
		}
	}
	if featured := c.Query("featured"); featured == "true" {
		countQuery = countQuery.Where("is_featured = ?", true)
	}
	if startDate := c.Query("start_date"); startDate != "" {
		if date, err := time.Parse("2006-01-02", startDate); err == nil {
			countQuery = countQuery.Where("start_date >= ?", date)
		}
	}
	if endDate := c.Query("end_date"); endDate != "" {
		if date, err := time.Parse("2006-01-02", endDate); err == nil {
			countQuery = countQuery.Where("start_date <= ?", date)
		}
	}
	countQuery.Count(&total)

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

	if err := query.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Set Content-Range header for React Admin pagination
	start := offset
	end := offset + len(events) - 1
	if end < start {
		end = start
	}
	contentRange := "events " + strconv.Itoa(start) + "-" + strconv.Itoa(end) + "/" + strconv.FormatInt(total, 10)
	c.Header("Content-Range", contentRange)

	c.JSON(http.StatusOK, events)
}

// GetEvent handles GET /api/events/:id
func (h *EventHandler) GetEvent(c *gin.Context) {
	id := c.Param("id")

	var event models.Event
	database := db.GetDB()

	if err := database.Preload("CreatedBy").First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Check if published for non-admin users
	user, userExists := getUserFromContext(c)
	if !userExists || !user.IsAdmin {
		if !event.IsPublished {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
	}

	c.JSON(http.StatusOK, event)
}

// CreateEvent handles POST /api/events (admin only)
func (h *EventHandler) CreateEvent(c *gin.Context) {
	var input models.EventInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, exists := getUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	event := models.Event{
		Title:         input.Title,
		Description:   input.Description,
		EventURL:      input.EventURL,
		ImageURL:      input.ImageURL,
		StartDate:     input.StartDate,
		EndDate:       input.EndDate,
		IsAllDay:      input.IsAllDay,
		OrganizerName: input.OrganizerName,
		OrganizerURL:  input.OrganizerURL,
		SourceURL:     input.SourceURL,
		SourceType:    input.SourceType,
		IsPublished:   input.IsPublished,
		IsFeatured:    input.IsFeatured,
		CreatedByID:   &user.ID,
	}

	database := db.GetDB()
	if err := database.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Load the created event with creator
	database.Preload("CreatedBy").First(&event, event.ID)

	c.JSON(http.StatusCreated, event)
}

// UpdateEvent handles PUT /api/events/:id (admin only)
func (h *EventHandler) UpdateEvent(c *gin.Context) {
	id := c.Param("id")

	var input models.EventInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var event models.Event
	database := db.GetDB()

	if err := database.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Update fields
	event.Title = input.Title
	event.Description = input.Description
	event.EventURL = input.EventURL
	event.ImageURL = input.ImageURL
	event.StartDate = input.StartDate
	event.EndDate = input.EndDate
	event.IsAllDay = input.IsAllDay
	event.OrganizerName = input.OrganizerName
	event.OrganizerURL = input.OrganizerURL
	event.SourceURL = input.SourceURL
	event.SourceType = input.SourceType
	event.IsPublished = input.IsPublished
	event.IsFeatured = input.IsFeatured

	if err := database.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Load the updated event with creator
	database.Preload("CreatedBy").First(&event, event.ID)

	c.JSON(http.StatusOK, event)
}

// DeleteEvent handles DELETE /api/events/:id (admin only)
func (h *EventHandler) DeleteEvent(c *gin.Context) {
	id := c.Param("id")

	var event models.Event
	database := db.GetDB()

	if err := database.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	if err := database.Delete(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}

// GetEventCalendar handles GET /api/events/calendar
// Returns events formatted for calendar display
func (h *EventHandler) GetEventCalendar(c *gin.Context) {
	var events []models.Event
	database := db.GetDB()

	// Build query for calendar view
	query := database.Where("is_published = ?", true).Order("start_date ASC")

	// Default to current month if no date range specified
	startDate := time.Now().AddDate(0, 0, -30) // 30 days ago
	endDate := time.Now().AddDate(0, 3, 0)     // 3 months from now

	if start := c.Query("start"); start != "" {
		if date, err := time.Parse("2006-01-02", start); err == nil {
			startDate = date
		}
	}

	if end := c.Query("end"); end != "" {
		if date, err := time.Parse("2006-01-02", end); err == nil {
			endDate = date
		}
	}

	query = query.Where("start_date >= ? AND start_date <= ?", startDate, endDate)

	if err := query.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Format for calendar (simplified structure)
	var calendarEvents []gin.H
	for _, event := range events {
		calendarEvent := gin.H{
			"id":     event.ID,
			"title":  event.Title,
			"start":  event.StartDate.Format("2006-01-02T15:04:05"),
			"allDay": event.IsAllDay,
			"url":    event.EventURL,
			"extendedProps": gin.H{
				"description":  event.Description,
				"organizer":    event.OrganizerName,
				"organizerUrl": event.OrganizerURL,
				"isFeatured":   event.IsFeatured,
			},
		}

		if event.EndDate != nil {
			calendarEvent["end"] = event.EndDate.Format("2006-01-02T15:04:05")
		}

		calendarEvents = append(calendarEvents, calendarEvent)
	}

	c.JSON(http.StatusOK, calendarEvents)
}

// ExtractMetadata handles POST /api/events/extract-metadata (admin only)
// Extracts metadata from a URL for event creation
func (h *EventHandler) ExtractMetadata(c *gin.Context) {
	var input struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	extractor := services.NewMetadataExtractor()
	metadata, err := extractor.ExtractFromURL(input.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to extract metadata",
			"details": err.Error(),
		})
		return
	}

	// Convert extracted metadata to event input format
	eventInput := gin.H{
		"title":          metadata.Title,
		"description":    metadata.Description,
		"event_url":      metadata.URL,
		"image_url":      metadata.ImageURL,
		"organizer_name": metadata.OrganizerName,
		"organizer_url":  metadata.OrganizerURL,
		"source_url":     input.URL,
		"source_type":    "url",
		"is_published":   false, // Default to draft for review
		"is_featured":    false,
	}

	// Add start and end dates if available
	if metadata.StartDate != nil {
		eventInput["start_date"] = metadata.StartDate.Format(time.RFC3339)
	}
	if metadata.EndDate != nil {
		eventInput["end_date"] = metadata.EndDate.Format(time.RFC3339)
	}

	// Store raw extracted data for reference
	if len(metadata.ExtraData) > 0 {
		if jsonData, err := json.Marshal(metadata.ExtraData); err == nil {
			extractedData := string(jsonData)
			eventInput["extracted_data"] = extractedData
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"event_data":   eventInput,
		"raw_metadata": metadata,
	})
}

// ProcessImageOCR handles POST /api/events/process-image (admin only)
// Processes an uploaded image using OCR to extract event details
func (h *EventHandler) ProcessImageOCR(c *gin.Context) {
	var input struct {
		ImageData string `json:"image_data" binding:"required"` // Base64 encoded image
		ImageURL  string `json:"image_url"`                     // Alternative: URL to image
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ocrService := services.NewOCRService()
	var result *services.OCRResult
	var err error

	if input.ImageData != "" {
		// Process base64 image data
		result, err = ocrService.ProcessImageFromBase64(input.ImageData)
	} else if input.ImageURL != "" {
		// Process image from URL
		result, err = ocrService.ProcessImageFromURL(input.ImageURL)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Either image_data or image_url is required"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to process image",
			"details": err.Error(),
		})
		return
	}

	// Extract additional event information from the OCR text
	eventInfo := ocrService.ExtractEventInfoFromText(result.Text)

	// Merge extracted data
	for key, value := range eventInfo {
		if result.ExtractedData == nil {
			result.ExtractedData = make(map[string]string)
		}
		result.ExtractedData[key] = value
	}

	// Create suggested event input based on OCR results
	eventInput := gin.H{
		"description":  result.Text,
		"source_type":  "image",
		"is_published": false, // Default to draft for review
		"is_featured":  false,
	}

	// Try to extract structured data from OCR results
	if title, exists := result.ExtractedData["title"]; exists {
		eventInput["title"] = title
	}
	if date, exists := result.ExtractedData["date"]; exists {
		eventInput["extracted_date"] = date
	}
	if time, exists := result.ExtractedData["time"]; exists {
		eventInput["extracted_time"] = time
	}
	if location, exists := result.ExtractedData["location"]; exists {
		eventInput["extracted_location"] = location
	}

	// Store raw OCR data for reference
	if jsonData, err := json.Marshal(result.ExtractedData); err == nil {
		extractedData := string(jsonData)
		eventInput["extracted_data"] = extractedData
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"ocr_result":  result,
		"event_data":  eventInput,
		"suggestions": result.ExtractedData,
	})
}

// ProcessPDFExtraction handles POST /api/events/process-pdf (admin only)
// Processes an uploaded PDF to extract event details
func (h *EventHandler) ProcessPDFExtraction(c *gin.Context) {
	var input struct {
		PDFData string `json:"pdf_data" binding:"required"` // Base64 encoded PDF
		PDFURL  string `json:"pdf_url"`                     // Alternative: URL to PDF
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pdfService := services.NewPDFService()
	var result *services.PDFExtractResult
	var err error

	if input.PDFData != "" {
		// Process base64 PDF data
		result, err = pdfService.ExtractTextFromBase64PDF(input.PDFData)
	} else if input.PDFURL != "" {
		// Process PDF from URL
		result, err = pdfService.ExtractTextFromURL(input.PDFURL)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Either pdf_data or pdf_url is required"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to process PDF",
			"details": err.Error(),
		})
		return
	}

	// Extract additional event information from the PDF text
	eventInfo := pdfService.ExtractEventInfoFromPDFText(result.Text)

	// Merge extracted data
	for key, value := range eventInfo {
		if result.ExtractedData == nil {
			result.ExtractedData = make(map[string]string)
		}
		result.ExtractedData[key] = value
	}

	// Create suggested event input based on PDF results
	eventInput := gin.H{
		"description":  result.Text,
		"source_type":  "pdf",
		"is_published": false, // Default to draft for review
		"is_featured":  false,
	}

	// Try to extract structured data from PDF results
	if title, exists := result.ExtractedData["title"]; exists {
		eventInput["title"] = title
	}
	if date, exists := result.ExtractedData["extracted_date"]; exists {
		eventInput["extracted_date"] = date
	}
	if time, exists := result.ExtractedData["extracted_time"]; exists {
		eventInput["extracted_time"] = time
	}
	if location, exists := result.ExtractedData["location"]; exists {
		eventInput["extracted_location"] = location
	}
	if organizer, exists := result.ExtractedData["organizer"]; exists {
		eventInput["organizer_name"] = organizer
	}

	// Store raw PDF extraction data for reference
	if jsonData, err := json.Marshal(result.ExtractedData); err == nil {
		extractedData := string(jsonData)
		eventInput["extracted_data"] = extractedData
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"pdf_result":  result,
		"event_data":  eventInput,
		"suggestions": result.ExtractedData,
		"page_count":  result.PageCount,
	})
}
