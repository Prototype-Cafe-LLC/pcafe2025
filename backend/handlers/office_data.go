package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
)

// GetOfficeDataList handles GET /api/officedata/
// Compatible with Django OfficeDataViewSet
func GetOfficeDataList(c *gin.Context) {
	var query models.OfficeDataQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := db.GetDB()
	var officeData []models.OfficeData

	// Build query
	q := db.Order("time ASC")

	// Handle Django-style ?num=X parameter (get last X records)
	if query.Num > 0 {
		var count int64
		db.Model(&models.OfficeData{}).Count(&count)
		start := int(count) - query.Num
		if start < 0 {
			start = 0
		}
		q = q.Offset(start)
	} else {
		// Handle time range filtering
		if !query.StartTime.IsZero() {
			q = q.Where("time >= ?", query.StartTime)
		}
		if !query.EndTime.IsZero() {
			q = q.Where("time <= ?", query.EndTime)
		}

		// Handle pagination
		if query.Offset > 0 {
			q = q.Offset(query.Offset)
		}
		if query.Limit > 0 {
			q = q.Limit(query.Limit)
		}
	}

	if err := q.Find(&officeData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, officeData)
}

// CreateOfficeData handles POST /api/officedata/
// Compatible with Django OfficeDataViewSet
func CreateOfficeData(c *gin.Context) {
	var input models.OfficeDataInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create new office data entry
	officeData := models.OfficeData{
		Time:         time.Now().UTC(),
		Temperature:  input.Temperature,
		CO2:          input.CO2,
		Ambient:      input.Ambient,
		EventTitle:   input.EventTitle,
		Light:        input.Light,
		OfficeOpen:   input.OfficeOpen,
		ParkingSlot1: input.ParkingSlot1,
		ParkingSlot2: input.ParkingSlot2,
	}

	db := db.GetDB()
	if err := db.Create(&officeData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, officeData)
}

// GetOfficeDataByID handles GET /api/officedata/{id}/
func GetOfficeDataByID(c *gin.Context) {
	timeStr := c.Param("time")
	parsedTime, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format"})
		return
	}

	var officeData models.OfficeData
	db := db.GetDB()
	if err := db.Where("time = ?", parsedTime).First(&officeData).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Office data not found"})
		return
	}

	c.JSON(http.StatusOK, officeData)
}

// GetLatestOfficeData handles GET /api/latest/
// Compatible with Django OfficeLatestDataViewSet
func GetLatestOfficeData(c *gin.Context) {
	var officeData models.OfficeData
	db := db.GetDB()
	if err := db.Order("time DESC").First(&officeData).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No office data found"})
		return
	}

	c.JSON(http.StatusOK, []models.OfficeData{officeData})
}

// GetOfficeDataJSON handles GET /jlist/ (Django compatibility endpoint)
func GetOfficeDataJSON(c *gin.Context) {
	var query models.OfficeDataQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := db.GetDB()
	var officeData []models.OfficeData

	// Build query similar to Django view
	q := db.Order("time ASC")

	if query.Num > 0 {
		var count int64
		db.Model(&models.OfficeData{}).Count(&count)
		start := int(count) - query.Num
		if start < 0 {
			start = 0
		}
		q = q.Offset(start)
	}

	if err := q.Find(&officeData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to Django-compatible format with local time
	result := make([]gin.H, len(officeData))
	for i, data := range officeData {
		// Convert UTC to JST (similar to Django as_dict method)
		jstTime := data.Time.In(time.FixedZone("JST", 9*60*60))

		result[i] = gin.H{
			"time":          jstTime.Format("2006-01-02 15:04:05"),
			"temperature":   data.Temperature,
			"co2":           data.CO2,
			"ambient":       data.Ambient,
			"event_title":   data.EventTitle,
			"light":         data.Light,
			"office_open":   data.OfficeOpen,
			"parking_slot1": data.ParkingSlot1,
			"parking_slot2": data.ParkingSlot2,
		}
	}

	c.JSON(http.StatusOK, result)
}

// GetLastOfficeData handles GET /jlast/ (Django compatibility endpoint)
func GetLastOfficeData(c *gin.Context) {
	var officeData models.OfficeData
	db := db.GetDB()
	if err := db.Order("time DESC").First(&officeData).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No office data found"})
		return
	}

	// Convert to Django-compatible format with local time
	jstTime := officeData.Time.In(time.FixedZone("JST", 9*60*60))

	result := []gin.H{{
		"time":          jstTime.Format("2006-01-02 15:04:05"),
		"temperature":   officeData.Temperature,
		"co2":           officeData.CO2,
		"ambient":       officeData.Ambient,
		"event_title":   officeData.EventTitle,
		"light":         officeData.Light,
		"office_open":   officeData.OfficeOpen,
		"parking_slot1": officeData.ParkingSlot1,
		"parking_slot2": officeData.ParkingSlot2,
	}}

	c.JSON(http.StatusOK, result)
}
