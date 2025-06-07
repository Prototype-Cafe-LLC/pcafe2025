package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
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
	user, userExists := c.Get("user")
	if !userExists || !user.(*models.User).IsAdmin {
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
	user, userExists := c.Get("user")
	if !userExists || !user.(*models.User).IsAdmin {
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

	user := c.MustGet("user").(*models.User)

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
