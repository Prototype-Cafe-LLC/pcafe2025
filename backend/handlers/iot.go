package handlers

import (
	"fmt"
	"math"
	"math/rand"
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

// GetChartData handles GET /api/iot/chart-data
func (h *IoTHandler) GetChartData(c *gin.Context) {
	timeRange := c.DefaultQuery("range", "3d")
	deviceID := c.Query("device_id")
	sensorTypes := c.QueryArray("sensor_types") // Support multiple sensor types

	if len(sensorTypes) == 0 {
		// Default sensor types if none specified
		sensorTypes = []string{"temperature", "co2"}
	}

	database := db.GetDB()

	// Determine time range and aggregation strategy
	var startTime time.Time
	var binSize string
	var useAggregation bool

	now := time.Now()
	switch timeRange {
	case "3d":
		startTime = now.Add(-72 * time.Hour)
		binSize = "5 minutes"
		useAggregation = false // Raw data for 3 days
	case "1w":
		startTime = now.Add(-7 * 24 * time.Hour)
		binSize = "30 minutes"
		useAggregation = true
	case "1m":
		startTime = now.Add(-30 * 24 * time.Hour)
		binSize = "2 hours"
		useAggregation = true
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time range. Use 3d, 1w, or 1m"})
		return
	}

	chartData := make(map[string]interface{})

	for _, sensorType := range sensorTypes {
		if useAggregation {
			// Aggregated data with high/low/avg
			query := `
				SELECT 
					time_bucket($1, time) AS bucket,
					MIN(value) as low,
					MAX(value) as high,
					AVG(value) as avg,
					COUNT(*) as count
				FROM iot_data 
				WHERE time >= $2 
					AND sensor_type = $3
			`
			args := []interface{}{binSize, startTime, sensorType}
			argIndex := 4

			if deviceID != "" {
				query += " AND device_id = $" + strconv.Itoa(argIndex)
				args = append(args, deviceID)
				argIndex++
			}

			query += " GROUP BY bucket ORDER BY bucket"

			type AggregatedPoint struct {
				Bucket time.Time `json:"time"`
				Low    float64   `json:"low"`
				High   float64   `json:"high"`
				Avg    float64   `json:"avg"`
				Count  int64     `json:"count"`
			}

			var points []AggregatedPoint
			if err := database.Raw(query, args...).Scan(&points).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			chartData[sensorType] = points
		} else {
			// Raw data for 3-day view
			var iotData []models.IoTData
			query := database.Where("time >= ? AND sensor_type = ?", startTime, sensorType)

			if deviceID != "" {
				query = query.Where("device_id = ?", deviceID)
			}

			// Limit to reasonable number of points for 3-day view
			query = query.Order("time ASC").Limit(2000)

			if err := query.Find(&iotData).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			// Transform to chart format
			type SimplePoint struct {
				Time  time.Time `json:"time"`
				Value float64   `json:"value"`
			}

			var points []SimplePoint
			for _, data := range iotData {
				points = append(points, SimplePoint{
					Time:  data.Time,
					Value: data.Value,
				})
			}

			chartData[sensorType] = points
		}
	}

	response := gin.H{
		"data": chartData,
		"meta": gin.H{
			"range":       timeRange,
			"startTime":   startTime,
			"endTime":     now,
			"binSize":     binSize,
			"dataType":    map[bool]string{true: "aggregated", false: "raw"}[useAggregation],
			"sensorTypes": sensorTypes,
		},
	}

	if deviceID != "" {
		response["meta"].(gin.H)["deviceId"] = deviceID
	}

	c.JSON(http.StatusOK, response)
}

// PopulateSampleData handles POST /api/iot/sample-data (admin only)
func (h *IoTHandler) PopulateSampleData(c *gin.Context) {
	database := db.GetDB()

	// Clear existing sample data first
	if err := database.Where("device_id LIKE ?", "sample-%").Delete(&models.IoTData{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear existing sample data"})
		return
	}

	// Generate sample data for last 60 days
	now := time.Now()
	startTime := now.Add(-60 * 24 * time.Hour)

	var sampleData []models.IoTData

	// Generate data points every 10 minutes for 60 days
	for t := startTime; t.Before(now); t = t.Add(10 * time.Minute) {
		// Temperature data (18-28°C with daily variation)
		baseTemp := 22.0
		dailyVariation := 3.0 * math.Sin(2*math.Pi*float64(t.Hour())/24.0) // Daily cycle
		randomVariation := (rand.Float64() - 0.5) * 2.0                    // Random ±1°C
		temperature := baseTemp + dailyVariation + randomVariation

		sampleData = append(sampleData, models.IoTData{
			Time:       t,
			DeviceID:   "sample-office-01",
			DeviceName: "Office Temperature Sensor",
			DeviceType: "temperature_sensor",
			Location:   "Main Office",
			SensorType: "temperature",
			Value:      temperature,
			Unit:       "°C",
			Quality:    "good",
			Accuracy:   0.1,
		})

		// CO2 data (400-1200 ppm with office hours pattern)
		baseCO2 := 450.0
		// Higher during office hours (9-17)
		if t.Hour() >= 9 && t.Hour() <= 17 {
			baseCO2 = 800.0 + rand.Float64()*300.0 // 800-1100 during work hours
		} else {
			baseCO2 = 400.0 + rand.Float64()*100.0 // 400-500 during off hours
		}
		randomCO2Variation := (rand.Float64() - 0.5) * 100.0 // Random ±50 ppm
		co2Level := baseCO2 + randomCO2Variation

		sampleData = append(sampleData, models.IoTData{
			Time:       t,
			DeviceID:   "sample-office-02",
			DeviceName: "Office CO2 Sensor",
			DeviceType: "co2_sensor",
			Location:   "Main Office",
			SensorType: "co2",
			Value:      co2Level,
			Unit:       "ppm",
			Quality:    "good",
			Accuracy:   5.0,
		})
	}

	// Batch insert for performance
	batchSize := 1000
	for i := 0; i < len(sampleData); i += batchSize {
		end := i + batchSize
		if end > len(sampleData) {
			end = len(sampleData)
		}

		if err := database.Create(sampleData[i:end]).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to insert batch %d: %v", i/batchSize+1, err)})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Sample data populated successfully",
		"count":   len(sampleData),
		"period":  "60 days",
		"devices": []string{"sample-office-01", "sample-office-02"},
	})
}

// ClearSampleData handles DELETE /api/iot/sample-data (admin only)
func (h *IoTHandler) ClearSampleData(c *gin.Context) {
	database := db.GetDB()

	// Count existing sample data
	var count int64
	database.Model(&models.IoTData{}).Where("device_id LIKE ?", "sample-%").Count(&count)

	// Delete sample data
	result := database.Where("device_id LIKE ?", "sample-%").Delete(&models.IoTData{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Sample data cleared successfully",
		"deleted_count":  result.RowsAffected,
		"previous_count": count,
	})
}
