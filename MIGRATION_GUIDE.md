# PCafe 2025 Migration Guide

This guide covers the migration from the existing Django-based PCafe system to
the new Go + React architecture.

## 🔄 Migration Overview

### What's Being Migrated

1. **OfficeData (IoT Sensor Data)** - Django `monitor.OfficeData` →
   Go `OfficeData` model
2. **Event Data** - Website event listings → Go `Event` model
3. **Contact Form** - Email configuration to `yuki.kikuchi+hp_contact@prototype-cafe.space`
4. **API Compatibility** - Maintaining Django REST API endpoints

### Key Changes

- **Database**: PostgreSQL + TimescaleDB (optimized for time-series data)
- **API**: Go + Gin framework (Django REST API compatible)
- **Frontend**: React + TypeScript (replacing Django templates)
- **Email**: SMTP service for contact form notifications

## 📊 OfficeData Migration

### Django Model Structure

```python
class OfficeData(models.Model):
    time = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField(default=0)
    co2 = models.IntegerField(default=0)
    ambient = models.IntegerField(default=0)
    event_title = models.CharField(max_length=128)
    light = models.BooleanField(default=False)
    office_open = models.BooleanField(default=False)
    parking_slot1 = models.BooleanField(default=False)
    parking_slot2 = models.BooleanField(default=False)
```

### New Go Model

```go
type OfficeData struct {
    Time         time.Time `gorm:"primaryKey" json:"time"`
    Temperature  float64   `json:"temperature"`
    CO2          int       `json:"co2"`
    Ambient      int       `json:"ambient"`
    EventTitle   string    `json:"event_title"`
    Light        bool      `json:"light"`
    OfficeOpen   bool      `json:"office_open"`
    ParkingSlot1 bool      `json:"parking_slot1"`
    ParkingSlot2 bool      `json:"parking_slot2"`
}
```

### Migration Command

```bash
# Migrate OfficeData from Django database
make migrate-django DJANGO_DSN="postgresql://user:pass@host:port/django_db"

# Example with actual connection
make migrate-django \
  DJANGO_DSN="postgresql://django_user:password@localhost:5432/prototype_cafe"
```

## 🔌 API Compatibility

### Maintained Django Endpoints

The new Go backend maintains full compatibility with existing Django REST API endpoints:

#### 1. Office Data API - `/api/officedata/`

**GET** - List office data (Django compatible)

```bash
# Get all records
curl -H 'Accept: application/json' https://api.pcafe2025.com/api/officedata/

# Get last N records (Django ?num= parameter)
curl -H 'Accept: application/json' https://api.pcafe2025.com/api/officedata/?num=10

# Time range filtering
curl -H 'Accept: application/json' https://api.pcafe2025.com/api/officedata/?start_time=2025-01-01T00:00:00Z&end_time=2025-01-07T23:59:59Z
```

**POST** - Create new office data

```bash
curl -X POST -H 'Content-Type: application/json' \
  https://api.pcafe2025.com/api/officedata/ \
  -d '{
    "temperature": 22.5,
    "co2": 450,
    "ambient": 300,
    "event_title": "IoT Meetup",
    "light": true,
    "office_open": true,
    "parking_slot1": false,
    "parking_slot2": true
  }'
```

#### 2. Latest Data API - `/api/latest/`

```bash
# Get latest office data record
curl -H 'Accept: application/json' https://api.pcafe2025.com/api/latest/
```

#### 3. Legacy JSON Endpoints

**Django Compatibility Routes:**

```bash
# Get office data as JSON list (Django /jlist/ compatible)
curl https://api.pcafe2025.com/jlist/
curl https://api.pcafe2025.com/jlist/?num=5

# Get last record (Django /jlast/ compatible)
curl https://api.pcafe2025.com/jlast/
```

### Response Format

The API maintains Django's time format convention (JST timezone):

```json
[
  {
    "time": "2025-01-07 15:30:26",
    "temperature": 22.5,
    "co2": 450,
    "ambient": 300,
    "event_title": "IoT Meetup",
    "light": true,
    "office_open": true,
    "parking_slot1": false,
    "parking_slot2": true
  }
]
```

## 📅 Event Migration

### Event Data Sources

1. **Website Scraping**: Extract events from
   <https://www.prototype-cafe.space/event/>
2. **Manual Curation**: Convert recurring events to scheduled entries
3. **External APIs**: Connpass, Doorkeeper integration (future)

### Event Migration Command

```bash
# Migrate events from PCafe website
make migrate-events
```

### Migrated Events Include

- **Regular Meetups**: JAWS-UG, Code for Niigata, Niigata 5min Tech
- **Conferences**: PHP Conference Niigata, SRE events
- **Workshops**: AI CRAFT Hacks, IoTLT sessions
- **Community Events**: NINNO Tech Fest

## 📧 Contact Form Configuration

### Email Settings

The contact form sends notifications to:
`yuki.kikuchi+hp_contact@prototype-cafe.space`

### Environment Configuration

```bash
# Email service configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@prototype-cafe.space

# Cloudflare Turnstile (required)
TURNSTILE_SECRET_KEY=your_secret_key
TURNSTILE_SITE_KEY=your_site_key
```

### Contact API Endpoint

```bash
# Submit contact form
curl -X POST -H 'Content-Type: application/json' \
  https://api.pcafe2025.com/api/contact \
  -d '{
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "subject": "お問い合わせ",
    "message": "施設見学について相談したいです。",
    "form_type": "tour_request",
    "turnstile_token": "TURNSTILE_RESPONSE_TOKEN"
  }'
```

## 🗄️ Database Schema Changes

### TimescaleDB Optimization

The `office_data` table is converted to a TimescaleDB hypertable for optimal
time-series performance:

```sql
-- Automatic partitioning by day
SELECT create_hypertable('office_data', 'time',
  chunk_time_interval => INTERVAL '1 day');

-- Compression policy (7 days)
SELECT add_compression_policy('office_data', INTERVAL '7 days');

-- Retention policy (2 years)
SELECT add_retention_policy('office_data', INTERVAL '2 years');
```

### Performance Indexes

```sql
-- Time-based queries
CREATE INDEX idx_office_time ON office_data (time DESC);
CREATE INDEX idx_office_time_brin ON office_data USING BRIN (time);

-- Event and status queries
CREATE INDEX idx_office_event_time ON office_data (event_title, time DESC);
CREATE INDEX idx_office_open_time ON office_data (office_open, time DESC);
```

## 🚀 Deployment Steps

### 1. Database Setup

```bash
# Start PostgreSQL with TimescaleDB
make docker-up

# Run migrations
make db-setup

# Seed development data
make db-seed
```

### 2. Data Migration

```bash
# Migrate Django OfficeData
make migrate-django DJANGO_DSN="postgresql://django_user:pass@host:port/db"

# Migrate events from website
make migrate-events
```

### 3. Start Services

```bash
# Development server
make run-server

# Production build
make build-prod
```

## 🔧 Development Commands

```bash
# Database operations
make db-setup          # Initialize database
make db-seed           # Add sample data
make db-reset          # Reset database
make migrate-django    # Migrate from Django
make migrate-events    # Import events

# Server operations
make run-server        # Start API server
make dev              # Development with auto-reload
make build            # Build binary

# Code quality
make test             # Run tests
make lint             # Lint code
make fmt              # Format code
```

## 🔍 Verification

### API Compatibility Check

```bash
# Test Django endpoint compatibility
curl -s https://api.pcafe2025.com/api/officedata/ | jq '.[0]'
curl -s https://api.pcafe2025.com/jlist/?num=1 | jq '.[0]'

# Compare response formats with Django
diff <(curl -s django.prototype-cafe.space/api/officedata/) \
     <(curl -s api.pcafe2025.com/api/officedata/)
```

### Data Integrity Check

```bash
# Verify migration completeness
psql -d pcafe2025 -c "SELECT COUNT(*) FROM office_data;"
psql -d pcafe2025 -c "SELECT MIN(time), MAX(time) FROM office_data;"

# Check event data
psql -d pcafe2025 -c "SELECT COUNT(*) FROM events WHERE is_published = true;"
```

## 📞 Support

For migration issues or questions:

- **Technical Issues**: Check logs with `make docker-logs`
- **Data Migration**: Verify Django DSN connection
- **API Compatibility**: Test with provided curl examples
- **Email Configuration**: Verify SMTP settings and Turnstile keys

## 🎯 Success Criteria

Migration is complete when:

- ✅ All Django OfficeData migrated to TimescaleDB
- ✅ API endpoints return identical responses to Django
- ✅ Contact form sends emails to
  `yuki.kikuchi+hp_contact@prototype-cafe.space`
- ✅ Event data populated from website
- ✅ TimescaleDB optimization functioning (hypertables, compression)
- ✅ All existing integrations work without changes
