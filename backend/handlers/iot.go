package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
)

// IoTHandler handles IoT data operations
type IoTHandler struct{}

func NewIoTHandler() *IoTHandler {
	return &IoTHandler{}
}

// GetIoTData handles GET /api/iot/data
func (h *IoTHandler) GetIoTData(c *gin.Context) {
	var query models.IoTDataQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var iotData []models.IoTData
	database := db.GetDB()

	// Build query
	dbQuery := database.Order("time DESC")

	// Apply filters
	if query.DeviceID != "" {
		dbQuery = dbQuery.Where("device_id = ?", query.DeviceID)
	}

	if query.DeviceType != "" {
		dbQuery = dbQuery.Where("device_type = ?", query.DeviceType)
	}

	if query.SensorType != "" {
		dbQuery = dbQuery.Where("sensor_type = ?", query.SensorType)
	}

	if query.Location != "" {
		dbQuery = dbQuery.Where("location = ?", query.Location)
	}

	// Time range filters
	if !query.StartTime.IsZero() {
		dbQuery = dbQuery.Where("time >= ?", query.StartTime)
	}

	if !query.EndTime.IsZero() {
		dbQuery = dbQuery.Where("time <= ?", query.EndTime)
	}

	// Default time range if not specified (last 24 hours)
	if query.StartTime.IsZero() && query.EndTime.IsZero() {
		defaultStart := time.Now().Add(-24 * time.Hour)
		dbQuery = dbQuery.Where("time >= ?", defaultStart)
	}

	// Pagination
	limit := 1000 // Default limit for IoT data
	if query.Limit > 0 && query.Limit <= 10000 {
		limit = query.Limit
	}

	offset := 0
	if query.Offset > 0 {
		offset = query.Offset
	}

	dbQuery = dbQuery.Limit(limit).Offset(offset)

	if err := dbQuery.Find(&iotData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": iotData,
		"meta": gin.H{
			"count":  len(iotData),
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetIoTStats handles GET /api/iot/stats
func (h *IoTHandler) GetIoTStats(c *gin.Context) {
	var query models.IoTDataQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database := db.GetDB()

	// Build base query for statistics
	baseQuery := "SELECT device_id, sensor_type, MIN(time) as start_time, MAX(time) as end_time, COUNT(*) as count, MIN(value) as min_value, MAX(value) as max_value, AVG(value) as avg_value, SUM(value) as sum_value FROM iot_data WHERE 1=1"
	var args []interface{}
	argIndex := 0

	// Apply filters
	if query.DeviceID != "" {
		baseQuery += " AND device_id = $" + strconv.Itoa(argIndex+1)
		args = append(args, query.DeviceID)
		argIndex++
	}

	if query.SensorType != "" {
		baseQuery += " AND sensor_type = $" + strconv.Itoa(argIndex+1)
		args = append(args, query.SensorType)
		argIndex++
	}

	// Time range filters
	if !query.StartTime.IsZero() {
		baseQuery += " AND time >= $" + strconv.Itoa(argIndex+1)
		args = append(args, query.StartTime)
		argIndex++
	}

	if !query.EndTime.IsZero() {
		baseQuery += " AND time <= $" + strconv.Itoa(argIndex+1)
		args = append(args, query.EndTime)
		argIndex++
	}

	// Default time range if not specified (last 24 hours)
	if query.StartTime.IsZero() && query.EndTime.IsZero() {
		defaultStart := time.Now().Add(-24 * time.Hour)
		baseQuery += " AND time >= $" + strconv.Itoa(argIndex+1)
		args = append(args, defaultStart)
		argIndex++
	}

	baseQuery += " GROUP BY device_id, sensor_type ORDER BY device_id, sensor_type"

	var stats []models.IoTDataStats
	if err := database.Raw(baseQuery, args...).Scan(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// CreateIoTData handles POST /api/iot/data (admin only)
func (h *IoTHandler) CreateIoTData(c *gin.Context) {
	var input models.IoTDataInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	iotData := models.IoTData{
		Time:       time.Now(), // Use current time if not specified
		DeviceID:   input.DeviceID,
		DeviceName: input.DeviceName,
		DeviceType: input.DeviceType,
		Location:   input.Location,
		SensorType: input.SensorType,
		Value:      input.Value,
		Unit:       input.Unit,
		Quality:    input.Quality,
		Accuracy:   input.Accuracy,
		Metadata:   input.Metadata,
		RawData:    input.RawData,
	}

	// Set default quality if not specified
	if iotData.Quality == "" {
		iotData.Quality = "good"
	}

	database := db.GetDB()
	if err := database.Create(&iotData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, iotData)
}

// GetLatestIoTData handles GET /api/iot/latest
func (h *IoTHandler) GetLatestIoTData(c *gin.Context) {
	deviceID := c.Query("device_id")
	sensorType := c.Query("sensor_type")

	if deviceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "device_id parameter is required"})
		return
	}

	var iotData models.IoTData
	database := db.GetDB()

	query := database.Where("device_id = ?", deviceID).Order("time DESC")

	if sensorType != "" {
		query = query.Where("sensor_type = ?", sensorType)
	}

	if err := query.First(&iotData).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No data found for the specified device"})
		return
	}

	c.JSON(http.StatusOK, iotData)
}

// GetDevices handles GET /api/iot/devices
func (h *IoTHandler) GetDevices(c *gin.Context) {
	database := db.GetDB()

	type DeviceInfo struct {
		DeviceID    string    `json:"device_id"`
		DeviceName  string    `json:"device_name"`
		DeviceType  string    `json:"device_type"`
		Location    string    `json:"location"`
		LastSeen    time.Time `json:"last_seen"`
		SensorTypes []string  `json:"sensor_types"`
	}

	query := `
		SELECT 
			device_id,
			device_name,
			device_type,
			location,
			MAX(time) as last_seen,
			ARRAY_AGG(DISTINCT sensor_type) as sensor_types
		FROM iot_data 
		GROUP BY device_id, device_name, device_type, location 
		ORDER BY last_seen DESC
	`

	var devices []DeviceInfo
	if err := database.Raw(query).Scan(&devices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, devices)
}
