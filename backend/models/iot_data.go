package models

import (
	"time"
)

// OfficeData represents office sensor data (migrated from Django OfficeData model)
// This maintains compatibility with the existing Django API structure
// Table will be configured as a TimescaleDB hypertable for optimal performance
type OfficeData struct {
	// Primary key and time (hypertable partition key)
	Time time.Time `gorm:"primaryKey;not null;index:idx_office_time" json:"time"`
	
	// Sensor data (matching Django OfficeData fields exactly)
	Temperature  float64 `gorm:"default:0" json:"temperature"`
	CO2          int     `gorm:"default:0" json:"co2"`
	Ambient      int     `gorm:"default:0" json:"ambient"`
	EventTitle   string  `gorm:"size:128" json:"event_title"`
	Light        bool    `gorm:"default:false" json:"light"`
	OfficeOpen   bool    `gorm:"default:false" json:"office_open"`
	ParkingSlot1 bool    `gorm:"default:false" json:"parking_slot1"`
	ParkingSlot2 bool    `gorm:"default:false" json:"parking_slot2"`
}

// TableName sets the table name to match Django convention
func (OfficeData) TableName() string {
	return "office_data"
}

// IoTData represents extended IoT sensor data for future expansion
// This will be configured as a TimescaleDB hypertable for optimal performance
type IoTData struct {
	// Primary key and time (hypertable partition key)
	Time time.Time `gorm:"primaryKey;not null;index:idx_iot_time" json:"time"`
	
	// Device identification
	DeviceID   string `gorm:"primaryKey;not null;size:50;index:idx_iot_device" json:"device_id"`
	SensorType string `gorm:"primaryKey;size:50;not null;index" json:"sensor_type"`
	DeviceName string `gorm:"size:100;index" json:"device_name"`
	DeviceType string `gorm:"size:50;index" json:"device_type"`
	Location   string `gorm:"size:100;index" json:"location"`
	
	// Sensor data (SensorType is part of primary key above)
	Value      float64 `gorm:"not null" json:"value"`
	Unit       string  `gorm:"size:20" json:"unit"`
	
	// Data quality
	Quality    string  `gorm:"size:20;default:'good'" json:"quality"` // "good", "warning", "error"
	Accuracy   float64 `gorm:"default:0" json:"accuracy"`
	
	// Additional metadata (stored as JSONB for flexibility)
	Metadata map[string]interface{} `gorm:"type:jsonb" json:"metadata,omitempty"`
	
	// Raw data for debugging
	RawData string `gorm:"type:text" json:"raw_data,omitempty"`
}

// TableName sets the table name explicitly
func (IoTData) TableName() string {
	return "iot_data"
}

// OfficeDataInput represents the input structure for creating office data entries
// Matches Django OfficeData API format
type OfficeDataInput struct {
	Temperature  float64 `json:"temperature"`
	CO2          int     `json:"co2"`
	Ambient      int     `json:"ambient"`
	EventTitle   string  `json:"event_title" binding:"max=128"`
	Light        bool    `json:"light"`
	OfficeOpen   bool    `json:"office_open"`
	ParkingSlot1 bool    `json:"parking_slot1"`
	ParkingSlot2 bool    `json:"parking_slot2"`
}

// OfficeDataQuery represents query parameters for retrieving office data
type OfficeDataQuery struct {
	StartTime time.Time `form:"start_time"`
	EndTime   time.Time `form:"end_time"`
	Limit     int       `form:"limit"`
	Offset    int       `form:"offset"`
	Num       int       `form:"num"` // For Django compatibility (?num=X)
}

// IoTDataInput represents the input structure for creating IoT data entries
type IoTDataInput struct {
	DeviceID   string                 `json:"device_id" binding:"required,max=50"`
	DeviceName string                 `json:"device_name"`
	DeviceType string                 `json:"device_type"`
	Location   string                 `json:"location"`
	SensorType string                 `json:"sensor_type" binding:"required,max=50"`
	Value      float64                `json:"value" binding:"required"`
	Unit       string                 `json:"unit"`
	Quality    string                 `json:"quality"`
	Accuracy   float64                `json:"accuracy"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
	RawData    string                 `json:"raw_data,omitempty"`
}

// IoTDataQuery represents query parameters for retrieving IoT data
type IoTDataQuery struct {
	DeviceID   string    `form:"device_id"`
	DeviceType string    `form:"device_type"`
	SensorType string    `form:"sensor_type"`
	Location   string    `form:"location"`
	StartTime  time.Time `form:"start_time"`
	EndTime    time.Time `form:"end_time"`
	Interval   string    `form:"interval"` // "1m", "5m", "1h", "1d" etc. for aggregation
	Limit      int       `form:"limit"`
	Offset     int       `form:"offset"`
}

// IoTDataStats represents aggregated statistics for IoT data
type IoTDataStats struct {
	DeviceID   string    `json:"device_id"`
	SensorType string    `json:"sensor_type"`
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	Count      int64     `json:"count"`
	MinValue   float64   `json:"min_value"`
	MaxValue   float64   `json:"max_value"`
	AvgValue   float64   `json:"avg_value"`
	SumValue   float64   `json:"sum_value"`
}