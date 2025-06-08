# PCafe 2025 Backend - Database Design

This directory contains the database implementation for PCafe 2025, addressing
GitHub issue #27.

## 📊 Database Schema Overview

The database is designed to handle:

- **Standard web application data**: Users, events, blog posts, contact forms
- **IoT time-series data**: 50M+ records using TimescaleDB for optimal performance
- **Session-based authentication**: For admin users
- **Content management**: Blog posts with Markdown/HTML support

## 🗄️ Entity Relationship Design

### Core Entities

1. **Users**
   - Primary key: `id`
   - Fields: username, email, password, is_admin
   - Relationships: HasMany Sessions, BlogPosts, Events

2. **Sessions**
   - Primary key: `id`
   - Fields: session_id, user_id, expires_at, ip_address, user_agent
   - Relationships: BelongsTo User

3. **Events**
   - Primary key: `id`
   - Fields: title, description, start_date, end_date, organizer info, metadata
   - Features: URL/image/PDF metadata extraction, publishing controls
   - Relationships: BelongsTo User (creator)

4. **BlogPosts**
   - Primary key: `id`
   - Fields: title, slug, content, tags, publishing info
   - Features: Markdown/HTML support, SEO fields, view tracking
   - Relationships: BelongsTo User (author)

5. **ContactSubmissions**
   - Primary key: `id`
   - Fields: contact info, message, form metadata, Turnstile verification
   - Features: Spam detection, status tracking, admin notes

6. **IoTData** (TimescaleDB Hypertable)
   - Primary key: `(time, device_id)`
   - Fields: device info, sensor data, quality metrics, metadata
   - Features: Time-based partitioning, compression, continuous aggregates

## ⚡ TimescaleDB Optimization

### Hypertable Configuration

- **Partition Key**: `time` (timestamp)
- **Chunk Interval**: 1 day
- **Compression**: Enabled for chunks older than 7 days
- **Retention**: Data older than 2 years is automatically dropped

### Continuous Aggregates

- **Hourly aggregates**: `iot_data_hourly` - Real-time statistical summaries
- **Daily aggregates**: `iot_data_daily` - Long-term trend analysis

### Performance Indexes

- Composite indexes for common query patterns
- BRIN indexes for time-series efficiency
- Partial indexes for high-quality data only

## 🚀 Getting Started

### Prerequisites

**Required software:**

- Go 1.22+
- PostgreSQL 15+ with TimescaleDB extension
- Docker & Docker Compose (for local development)

### Quick Setup

```bash
# 1. Start PostgreSQL with TimescaleDB
make docker-up

# 2. Install Go dependencies
make setup

# 3. Setup database (migrations + hypertables)
make db-setup

# 4. Seed development data
make db-seed

# 5. Test database connection
make db-test
```

### Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit database credentials and other settings
# Required: DB_*, TURNSTILE_* variables
```

## 📋 Available Commands

### Database Operations

```bash
make db-setup      # Run migrations and setup TimescaleDB
make db-seed       # Seed with development data
make db-reset      # Drop, recreate, migrate, and seed
make db-test       # Test database connection
```

### Development

```bash
make dev           # Start development server with auto-reload
make build         # Build binary
make test          # Run tests with coverage
make lint          # Lint code
make fmt           # Format code
```

### Docker

```bash
make docker-up     # Start PostgreSQL + TimescaleDB
make docker-down   # Stop services
make docker-logs   # View database logs
make docker-clean  # Clean volumes and images
```

## 🗃️ Sample Data

Development seed data includes:

- **Admin user**: username=`admin`, password=`admin123`
- **Sample blog posts**: 3 posts demonstrating content features
- **Sample events**: IoT meetups and facility tours
- **Contact submissions**: Various form types and statuses
- **IoT sensor data**: 7 days of realistic time-series data from multiple devices

## 📈 IoT Data Structure

### Device Types

- **Temperature sensors**: 1F lobby, 2F office
- **Power meters**: Main electrical room
- **Environmental sensors**: Various locations

### Sensor Types

- `temperature` (°C)
- `humidity` (%)
- `power_consumption` (kWh)
- `voltage` (V)
- `current` (A)

### Data Quality Levels

- `good`: Normal operation (95%)
- `warning`: Sensor drift or minor issues (5%)
- `error`: Sensor malfunction (rare)

## 🔧 Migration System

Database migrations are located in `db/migrations/`:

- `001_initial_schema.sql`: Core table definitions
- `002_timescale_setup.sql`: TimescaleDB hypertable configuration

Custom migrations can be added following the naming pattern: `XXX_description.sql`

## 📊 Performance Considerations

### Query Optimization

- Use time-range queries with proper indexes
- Leverage continuous aggregates for statistical queries
- Filter by device_id or sensor_type when possible
- Use LIMIT and OFFSET for pagination

### Recommended Query Patterns

```sql
-- Efficient: Uses device_id + time index
SELECT * FROM iot_data
WHERE device_id = 'temp-001'
  AND time >= NOW() - INTERVAL '1 day'
ORDER BY time DESC;

-- Efficient: Uses continuous aggregate
SELECT * FROM iot_data_hourly
WHERE device_id = 'temp-001'
  AND hour >= NOW() - INTERVAL '1 week';
```

## 🛡️ Security Features

- **Password hashing**: bcrypt with default cost
- **Session management**: Secure cookie-based sessions
- **SQL injection protection**: GORM ORM with parameterized queries
- **Turnstile integration**: CAPTCHA verification for contact forms
- **Input validation**: Comprehensive validation rules

## 🎯 Addressing Issue #27 Requirements

✅ **ER diagram design**: Complete entity relationships defined
✅ **GORM models**: All models with proper relationships and validation
✅ **TimescaleDB setup**: Hypertables, compression, retention policies
✅ **Database migrations**: SQL migration files for schema setup
✅ **Database connection**: Configuration with connection pooling
✅ **Partitioning strategy**: Time-based partitioning with continuous aggregates
✅ **Seed data**: Comprehensive development data for all entities  

This implementation provides a robust foundation for the PCafe 2025 project with
optimized handling of both standard web application data and large-scale IoT
time-series data.