-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for PCafe 2025
-- Created: 2025-01-07

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_url VARCHAR(500),
    image_url VARCHAR(500),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    is_all_day BOOLEAN DEFAULT FALSE,
    organizer_name VARCHAR(100),
    organizer_url VARCHAR(500),
    source_url VARCHAR(500),
    source_type VARCHAR(50),
    extracted_data JSONB,
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'markdown',
    excerpt VARCHAR(500),
    meta_title VARCHAR(200),
    meta_description VARCHAR(300),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags JSONB,
    view_count INTEGER DEFAULT 0,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    form_type VARCHAR(50) DEFAULT 'general',
    source VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    turnstile_token VARCHAR(1000),
    turnstile_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'new',
    is_spam BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    response_sent BOOLEAN DEFAULT FALSE,
    response_sent_at TIMESTAMP WITH TIME ZONE
);

-- IoT data table (will be converted to hypertable)
CREATE TABLE IF NOT EXISTS iot_data (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    device_name VARCHAR(100),
    device_type VARCHAR(50),
    location VARCHAR(100),
    sensor_type VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    quality VARCHAR(20) DEFAULT 'good',
    accuracy DOUBLE PRECISION DEFAULT 0,
    metadata JSONB,
    raw_data TEXT,
    PRIMARY KEY (time, device_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sessions_deleted_at ON sessions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_created_by_id ON events(created_by_id);

CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at ON blog_posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_title ON blog_posts(title);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_deleted_at ON contact_submissions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_turnstile_verified ON contact_submissions(turnstile_verified);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_spam ON contact_submissions(is_spam);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_processed_at ON contact_submissions(processed_at);

CREATE INDEX IF NOT EXISTS idx_iot_time ON iot_data(time);
CREATE INDEX IF NOT EXISTS idx_iot_device ON iot_data(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_type ON iot_data(sensor_type);
CREATE INDEX IF NOT EXISTS idx_iot_location ON iot_data(location);
CREATE INDEX IF NOT EXISTS idx_iot_device_type ON iot_data(device_type);