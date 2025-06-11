package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
)

type SanjoTsubameCalendarHandler struct{}

func NewSanjoTsubameCalendarHandler() *SanjoTsubameCalendarHandler {
	return &SanjoTsubameCalendarHandler{}
}

// GetDateStatus returns the business day status for a specific date
// @Summary Get business day status for a specific date
// @Description Returns "on", "off", or "undefined" for a given date in Sanjo-Tsubame region
// @Tags SanjoTsubameCalendar
// @Produce json
// @Param year path int true "Year (e.g., 2025)"
// @Param month path int true "Month (1-12)"
// @Param day path int true "Day (1-31)"
// @Success 200 {object} models.SanjoTsubameStatusResponse
// @Failure 400 {object} map[string]string
// @Router /api/sanjo-tsubame-calendar/{year}/{month}/{day} [get]
func (h *SanjoTsubameCalendarHandler) GetDateStatus(c *gin.Context) {
	yearStr := c.Param("year")
	monthStr := c.Param("month")
	dayStr := c.Param("day")

	year, err := strconv.Atoi(yearStr)
	if err != nil || year < 2018 || year > 2030 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil || month < 1 || month > 12 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month"})
		return
	}

	day, err := strconv.Atoi(dayStr)
	if err != nil || day < 1 || day > 31 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid day"})
		return
	}

	// Check if date is valid
	if !isValidDate(year, month, day) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date"})
		return
	}

	database := db.GetDB()
	var entry models.SanjoTsubameCalendar

	result := database.Where("year = ? AND month = ? AND day = ?", year, month, day).First(&entry)
	
	status := "undefined"
	if result.Error == nil {
		status = entry.Status
	} else {
		// Fallback to hardcoded data for compatibility
		status = getHardcodedStatus(year, month, day)
	}

	response := models.SanjoTsubameStatusResponse{
		Year:   year,
		Month:  month,
		Date:   day,
		Status: status,
	}

	c.JSON(http.StatusOK, response)
}

// GetMonthStatus returns business day status for an entire month
// @Summary Get business day status for a month
// @Description Returns status for all days in a given month
// @Tags SanjoTsubameCalendar
// @Produce json
// @Param year path int true "Year (e.g., 2025)"
// @Param month path int true "Month (1-12)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /api/sanjo-tsubame-calendar/{year}/{month} [get]
func (h *SanjoTsubameCalendarHandler) GetMonthStatus(c *gin.Context) {
	yearStr := c.Param("year")
	monthStr := c.Param("month")

	year, err := strconv.Atoi(yearStr)
	if err != nil || year < 2018 || year > 2030 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil || month < 1 || month > 12 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month"})
		return
	}

	database := db.GetDB()
	var entries []models.SanjoTsubameCalendar

	database.Where("year = ? AND month = ?", year, month).Find(&entries)

	// Create a map for quick lookup
	statusMap := make(map[int]string)
	for _, entry := range entries {
		statusMap[entry.Day] = entry.Status
	}

	// Generate status for all days in the month
	daysInMonth := getDaysInMonth(year, month)
	result := make(map[string]interface{})
	
	for day := 1; day <= daysInMonth; day++ {
		key := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC).Format("2006-01-02")
		
		if status, exists := statusMap[day]; exists {
			result[key] = status
		} else {
			// Fallback to hardcoded data
			result[key] = getHardcodedStatus(year, month, day)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"year":   year,
		"month":  month,
		"data":   result,
	})
}

// CreateCalendarEntry creates or updates a calendar entry
// @Summary Create or update calendar entry
// @Description Create or update business day status for a specific date (admin only)
// @Tags SanjoTsubameCalendar
// @Accept json
// @Produce json
// @Param input body models.SanjoTsubameCalendarInput true "Calendar entry data"
// @Success 201 {object} models.SanjoTsubameCalendar
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Security SessionAuth
// @Router /api/sanjo-tsubame-calendar [post]
func (h *SanjoTsubameCalendarHandler) CreateCalendarEntry(c *gin.Context) {
	var input models.SanjoTsubameCalendarInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate date
	if !isValidDate(input.Year, input.Month, input.Day) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date"})
		return
	}

	database := db.GetDB()
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context not found"})
		return
	}
	user, ok := userInterface.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user context"})
		return
	}
	userID := user.ID

	var entry models.SanjoTsubameCalendar
	result := database.Where("year = ? AND month = ? AND day = ?", input.Year, input.Month, input.Day).First(&entry)

	if result.Error != nil {
		// Create new entry
		entry = models.SanjoTsubameCalendar{
			Year:        input.Year,
			Month:       input.Month,
			Day:         input.Day,
			Status:      input.Status,
			Notes:       input.Notes,
			CreatedByID: userID,
		}
		database.Create(&entry)
	} else {
		// Update existing entry
		entry.Status = input.Status
		entry.Notes = input.Notes
		database.Save(&entry)
	}

	c.JSON(http.StatusCreated, entry)
}

// BulkImportCalendarEntries imports multiple calendar entries for a month
// @Summary Bulk import calendar entries
// @Description Import multiple business day statuses for a month (admin only)
// @Tags SanjoTsubameCalendar
// @Accept json
// @Produce json
// @Param input body models.SanjoTsubameBulkImportRequest true "Bulk import data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Security SessionAuth
// @Router /api/sanjo-tsubame-calendar/bulk-import [post]
func (h *SanjoTsubameCalendarHandler) BulkImportCalendarEntries(c *gin.Context) {
	var input models.SanjoTsubameBulkImportRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database := db.GetDB()
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context not found"})
		return
	}
	user, ok := userInterface.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user context"})
		return
	}
	userID := user.ID

	created := 0
	updated := 0

	fmt.Printf("BulkImport: Processing %d days for %d/%d with status %s\n", len(input.Days), input.Year, input.Month, input.Status)

	for _, day := range input.Days {
		if !isValidDate(input.Year, input.Month, day) {
			fmt.Printf("BulkImport: Invalid date %d/%d/%d\n", input.Year, input.Month, day)
			continue
		}

		var entry models.SanjoTsubameCalendar
		result := database.Where("year = ? AND month = ? AND day = ?", input.Year, input.Month, day).First(&entry)

		if result.Error != nil {
			// Create new entry
			entry = models.SanjoTsubameCalendar{
				Year:        input.Year,
				Month:       input.Month,
				Day:         day,
				Status:      input.Status,
				CreatedByID: userID,
			}
			if err := database.Create(&entry).Error; err != nil {
				fmt.Printf("BulkImport: Error creating entry: %v\n", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create entry: %v", err)})
				return
			}
			created++
			fmt.Printf("BulkImport: Created entry for %d/%d/%d\n", input.Year, input.Month, day)
		} else {
			// Update existing entry
			entry.Status = input.Status
			if err := database.Save(&entry).Error; err != nil {
				fmt.Printf("BulkImport: Error updating entry: %v\n", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update entry: %v", err)})
				return
			}
			updated++
			fmt.Printf("BulkImport: Updated entry for %d/%d/%d\n", input.Year, input.Month, day)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Bulk import completed",
		"created": created,
		"updated": updated,
	})
}

// Helper functions

func isValidDate(year, month, day int) bool {
	date := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	return date.Year() == year && int(date.Month()) == month && date.Day() == day
}

func getDaysInMonth(year, month int) int {
	nextMonth := time.Date(year, time.Month(month+1), 1, 0, 0, 0, 0, time.UTC)
	lastDay := nextMonth.Add(-24 * time.Hour)
	return lastDay.Day()
}

// getHardcodedStatus provides fallback compatibility with original Django implementation
func getHardcodedStatus(year, month, day int) string {
	// This is a simplified version of the hardcoded data from Django
	// In production, you would want to import all the hardcoded data into the database
	holidayData := map[string][]int{
		"2025-1":  {1, 2, 3, 5, 11, 12, 13, 19, 25, 26},
		"2025-2":  {1, 2, 8, 9, 11, 16, 22, 23, 24},
		"2025-3":  {1, 2, 8, 9, 15, 16, 20, 23, 30},
		"2025-4":  {5, 6, 13, 19, 20, 26, 27, 29},
		"2025-5":  {3, 4, 5, 6, 11, 17, 18, 24, 25},
		"2025-6":  {1, 7, 8, 14, 15, 21, 22, 28, 29},
		"2025-7":  {5, 6, 12, 13, 19, 20, 21, 26, 27},
		"2025-8":  {2, 3, 10, 11, 13, 14, 15, 16, 17, 23, 24, 31},
		"2025-9":  {6, 7, 13, 14, 15, 20, 21, 23, 28},
		"2025-10": {4, 5, 11, 12, 13, 19, 25, 26},
		"2025-11": {2, 3, 9, 15, 16, 22, 23, 24, 30},
		"2025-12": {6, 7, 13, 14, 20, 21, 28, 30, 31},
	}

	key := strconv.Itoa(year) + "-" + strconv.Itoa(month)
	if holidays, exists := holidayData[key]; exists {
		for _, holiday := range holidays {
			if holiday == day {
				return "off"
			}
		}
		return "on"
	}

	return "undefined"
}