-- Migration: 002_timescale_setup.sql
-- Description: Convert iot_data table to TimescaleDB hypertable and setup partitioning
-- Created: 2025-01-07

-- Convert iot_data table to hypertable
SELECT create_hypertable('iot_data', 'time', 
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Create optimized indexes for TimescaleDB
CREATE INDEX IF NOT EXISTS idx_iot_device_time ON iot_data (device_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_time ON iot_data (sensor_type, time DESC);
CREATE INDEX IF NOT EXISTS idx_iot_location_time ON iot_data (location, time DESC);
CREATE INDEX IF NOT EXISTS idx_iot_device_sensor_time ON iot_data (device_id, sensor_type, time DESC);

-- Index for value range queries (only for good quality data)
CREATE INDEX IF NOT EXISTS idx_iot_value ON iot_data (value) WHERE quality = 'good';

-- BRIN index for time column (very efficient for time-series data)
CREATE INDEX IF NOT EXISTS idx_iot_time_brin ON iot_data USING BRIN (time);

-- Set up compression policy (compress chunks older than 7 days)
SELECT add_compression_policy('iot_data', INTERVAL '7 days');

-- Set up retention policy (drop chunks older than 2 years)
SELECT add_retention_policy('iot_data', INTERVAL '2 years');

-- Create continuous aggregates for common queries

-- Hourly aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS iot_data_hourly
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', time) AS hour,
    device_id,
    sensor_type,
    location,
    COUNT(*) as count,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    STDDEV(value) as stddev_value
FROM iot_data 
WHERE quality = 'good'
GROUP BY hour, device_id, sensor_type, location;

-- Daily aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS iot_data_daily
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', time) AS day,
    device_id,
    sensor_type,
    location,
    COUNT(*) as count,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    STDDEV(value) as stddev_value
FROM iot_data 
WHERE quality = 'good'
GROUP BY day, device_id, sensor_type, location;

-- Add refresh policies for continuous aggregates
SELECT add_continuous_aggregate_policy('iot_data_hourly',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

SELECT add_continuous_aggregate_policy('iot_data_daily',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');