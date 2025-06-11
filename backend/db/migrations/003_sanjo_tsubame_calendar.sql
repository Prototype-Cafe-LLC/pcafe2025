-- Migration: Add Sanjo-Tsubame Calendar table
-- Description: Creates table for business day/holiday status tracking for Sanjo-Tsubame region

-- Create sanjo_tsubame_calendars table
CREATE TABLE IF NOT EXISTS sanjo_tsubame_calendars (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Date components
    year INTEGER NOT NULL CHECK (year >= 2018 AND year <= 2030),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
    
    -- Status and metadata
    status VARCHAR(20) NOT NULL CHECK (status IN ('on', 'off', 'undefined')),
    notes TEXT,
    created_by_id INTEGER NOT NULL,
    
    -- Foreign key constraint
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate dates
    UNIQUE(year, month, day, deleted_at)
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_sanjo_date ON sanjo_tsubame_calendars(year, month, day);
CREATE INDEX IF NOT EXISTS idx_sanjo_status ON sanjo_tsubame_calendars(status);
CREATE INDEX IF NOT EXISTS idx_sanjo_created_by ON sanjo_tsubame_calendars(created_by_id);
CREATE INDEX IF NOT EXISTS idx_sanjo_deleted_at ON sanjo_tsubame_calendars(deleted_at);

-- Add update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sanjo_tsubame_calendars_updated_at 
    BEFORE UPDATE ON sanjo_tsubame_calendars 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for 2025 (following original Django pattern)
INSERT INTO sanjo_tsubame_calendars (year, month, day, status, created_by_id, notes) VALUES
-- January 2025 holidays
(2025, 1, 1, 'off', 1, 'New Year'),
(2025, 1, 2, 'off', 1, 'New Year Holiday'),
(2025, 1, 3, 'off', 1, 'New Year Holiday'),
(2025, 1, 5, 'off', 1, 'Weekend'),
(2025, 1, 11, 'off', 1, 'Weekend'),
(2025, 1, 12, 'off', 1, 'Weekend'),
(2025, 1, 13, 'off', 1, 'Coming of Age Day'),
(2025, 1, 19, 'off', 1, 'Weekend'),
(2025, 1, 25, 'off', 1, 'Weekend'),
(2025, 1, 26, 'off', 1, 'Weekend')
ON CONFLICT (year, month, day, deleted_at) DO NOTHING;