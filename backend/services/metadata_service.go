package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// MetadataExtractor handles extraction of metadata from various sources
type MetadataExtractor struct {
	client *http.Client
}

// ExtractedMetadata represents extracted metadata from various sources
type ExtractedMetadata struct {
	Title         string            `json:"title"`
	Description   string            `json:"description"`
	ImageURL      string            `json:"image_url"`
	URL           string            `json:"url"`
	SiteName      string            `json:"site_name"`
	StartDate     *time.Time        `json:"start_date,omitempty"`
	EndDate       *time.Time        `json:"end_date,omitempty"`
	OrganizerName string            `json:"organizer_name"`
	OrganizerURL  string            `json:"organizer_url"`
	ExtraData     map[string]string `json:"extra_data,omitempty"`
}

func NewMetadataExtractor() *MetadataExtractor {
	return &MetadataExtractor{
		client: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				ResponseHeaderTimeout: 10 * time.Second,
			},
		},
	}
}

// ExtractFromURL extracts metadata from a given URL
func (m *MetadataExtractor) ExtractFromURL(inputURL string) (*ExtractedMetadata, error) {
	// Validate and clean URL
	cleanURL, err := m.validateURL(inputURL)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	// Fetch the HTML content
	resp, err := m.client.Get(cleanURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	html := string(body)
	metadata := &ExtractedMetadata{
		URL:       cleanURL,
		ExtraData: make(map[string]string),
	}

	// Extract metadata using regex patterns
	m.extractOpenGraphData(html, metadata)
	m.extractTwitterCardData(html, metadata)
	m.extractBasicHTMLData(html, metadata)
	m.extractEventSpecificData(html, metadata)

	return metadata, nil
}

func (m *MetadataExtractor) validateURL(inputURL string) (string, error) {
	// Add protocol if missing
	if !strings.HasPrefix(inputURL, "http://") && !strings.HasPrefix(inputURL, "https://") {
		inputURL = "https://" + inputURL
	}

	parsedURL, err := url.Parse(inputURL)
	if err != nil {
		return "", err
	}

	if parsedURL.Host == "" {
		return "", fmt.Errorf("invalid URL format")
	}

	return parsedURL.String(), nil
}

// extractOpenGraphData extracts Open Graph metadata
func (m *MetadataExtractor) extractOpenGraphData(html string, metadata *ExtractedMetadata) {
	patterns := map[string]*string{
		`<meta\s+property="og:title"\s+content="([^"]*)"`:       &metadata.Title,
		`<meta\s+property="og:description"\s+content="([^"]*)"`: &metadata.Description,
		`<meta\s+property="og:image"\s+content="([^"]*)"`:       &metadata.ImageURL,
		`<meta\s+property="og:site_name"\s+content="([^"]*)"`:   &metadata.SiteName,
		`<meta\s+property="og:url"\s+content="([^"]*)"`:         &metadata.URL,
	}

	for pattern, field := range patterns {
		re := regexp.MustCompile(`(?i)` + pattern)
		if matches := re.FindStringSubmatch(html); len(matches) > 1 {
			*field = strings.TrimSpace(matches[1])
		}
	}

	// Extract event-specific Open Graph data
	eventPatterns := map[string]string{
		`<meta\s+property="event:start_time"\s+content="([^"]*)"`: "start_time",
		`<meta\s+property="event:end_time"\s+content="([^"]*)"`:   "end_time",
		`<meta\s+property="event:location"\s+content="([^"]*)"`:   "location",
	}

	for pattern, key := range eventPatterns {
		re := regexp.MustCompile(`(?i)` + pattern)
		if matches := re.FindStringSubmatch(html); len(matches) > 1 {
			metadata.ExtraData[key] = strings.TrimSpace(matches[1])
		}
	}
}

// extractTwitterCardData extracts Twitter Card metadata
func (m *MetadataExtractor) extractTwitterCardData(html string, metadata *ExtractedMetadata) {
	patterns := map[string]*string{
		`<meta\s+name="twitter:title"\s+content="([^"]*)"`:       &metadata.Title,
		`<meta\s+name="twitter:description"\s+content="([^"]*)"`: &metadata.Description,
		`<meta\s+name="twitter:image"\s+content="([^"]*)"`:       &metadata.ImageURL,
	}

	for pattern, field := range patterns {
		if *field != "" {
			continue // Skip if already filled by Open Graph
		}
		re := regexp.MustCompile(`(?i)` + pattern)
		if matches := re.FindStringSubmatch(html); len(matches) > 1 {
			*field = strings.TrimSpace(matches[1])
		}
	}
}

// extractBasicHTMLData extracts basic HTML metadata
func (m *MetadataExtractor) extractBasicHTMLData(html string, metadata *ExtractedMetadata) {
	// Title
	if metadata.Title == "" {
		re := regexp.MustCompile(`<title[^>]*>([^<]*)</title>`)
		if matches := re.FindStringSubmatch(html); len(matches) > 1 {
			metadata.Title = strings.TrimSpace(matches[1])
		}
	}

	// Description
	if metadata.Description == "" {
		re := regexp.MustCompile(`<meta\s+name="description"\s+content="([^"]*)"`)
		if matches := re.FindStringSubmatch(html); len(matches) > 1 {
			metadata.Description = strings.TrimSpace(matches[1])
		}
	}
}

// extractEventSpecificData attempts to extract event-specific information
func (m *MetadataExtractor) extractEventSpecificData(html string, metadata *ExtractedMetadata) {
	// Look for JSON-LD structured data
	m.extractJSONLD(html, metadata)

	// Look for common event platforms and their patterns
	m.extractPlatformSpecificData(html, metadata)
}

// extractJSONLD extracts data from JSON-LD structured data
func (m *MetadataExtractor) extractJSONLD(html string, metadata *ExtractedMetadata) {
	re := regexp.MustCompile(`<script[^>]*type="application/ld\+json"[^>]*>([^<]*)</script>`)
	matches := re.FindAllStringSubmatch(html, -1)

	for _, match := range matches {
		if len(match) > 1 {
			var data map[string]any
			if err := json.Unmarshal([]byte(match[1]), &data); err == nil {
				m.parseJSONLDEvent(data, metadata)
			}
		}
	}
}

func (m *MetadataExtractor) parseJSONLDEvent(data map[string]any, metadata *ExtractedMetadata) {
	if eventType, ok := data["@type"].(string); ok && eventType == "Event" {
		if name, ok := data["name"].(string); ok && metadata.Title == "" {
			metadata.Title = name
		}
		if description, ok := data["description"].(string); ok && metadata.Description == "" {
			metadata.Description = description
		}
		if image, ok := data["image"].(string); ok && metadata.ImageURL == "" {
			metadata.ImageURL = image
		}

		// Extract organizer information
		if organizer, ok := data["organizer"].(map[string]any); ok {
			if name, ok := organizer["name"].(string); ok {
				metadata.OrganizerName = name
			}
			if url, ok := organizer["url"].(string); ok {
				metadata.OrganizerURL = url
			}
		}

		// Extract start and end dates
		if startDate, ok := data["startDate"].(string); ok {
			if t, err := time.Parse(time.RFC3339, startDate); err == nil {
				metadata.StartDate = &t
			}
		}
		if endDate, ok := data["endDate"].(string); ok {
			if t, err := time.Parse(time.RFC3339, endDate); err == nil {
				metadata.EndDate = &t
			}
		}
	}
}

// extractPlatformSpecificData extracts data for known event platforms
func (m *MetadataExtractor) extractPlatformSpecificData(html string, metadata *ExtractedMetadata) {
	// Eventbrite patterns
	if strings.Contains(html, "eventbrite") {
		m.extractEventbriteData(html, metadata)
	}

	// Meetup patterns
	if strings.Contains(html, "meetup") {
		m.extractMeetupData(html, metadata)
	}

	// Facebook events
	if strings.Contains(html, "facebook.com/events") {
		m.extractFacebookEventData(html, metadata)
	}

	// Peatix patterns (popular in Japan)
	if strings.Contains(html, "peatix") {
		m.extractPeatixData(html, metadata)
	}
}

func (m *MetadataExtractor) extractEventbriteData(html string, metadata *ExtractedMetadata) {
	// Eventbrite specific patterns
	patterns := map[string]string{
		`"organizer":\s*{\s*"name":\s*"([^"]*)"`:  "organizer_name",
		`"organizer":\s*{\s*"url":\s*"([^"]*)"`:   "organizer_url",
		`"start":\s*{\s*"local":\s*"([^"]*)"`:     "start_time",
		`"end":\s*{\s*"local":\s*"([^"]*)"`:       "end_time",
		`"venue":\s*{\s*"name":\s*"([^"]*)"`:      "venue_name",
		`"venue":\s*{\s*"address":\s*"([^"]*)"`:   "venue_address",
	}

	for pattern, key := range patterns {
		re := regexp.MustCompile(pattern)
		if matches := re.FindStringSubmatch(html); len(matches) > 1 {
			value := strings.TrimSpace(matches[1])
			if key == "organizer_name" && metadata.OrganizerName == "" {
				metadata.OrganizerName = value
			} else if key == "organizer_url" && metadata.OrganizerURL == "" {
				metadata.OrganizerURL = value
			} else {
				metadata.ExtraData[key] = value
			}
		}
	}
}

func (m *MetadataExtractor) extractMeetupData(html string, metadata *ExtractedMetadata) {
	// Meetup specific patterns would go here
	// Implementation depends on Meetup's current HTML structure
}

func (m *MetadataExtractor) extractFacebookEventData(html string, metadata *ExtractedMetadata) {
	// Facebook event specific patterns would go here
	// Note: Facebook often requires login for full event details
}

func (m *MetadataExtractor) extractPeatixData(html string, metadata *ExtractedMetadata) {
	// Peatix specific patterns for Japanese events
	patterns := map[string]string{
		`"organizer_name":"([^"]*)"`:    "organizer_name",
		`"event_start_at":"([^"]*)"`:    "start_time",
		`"event_end_at":"([^"]*)"`:      "end_time",
		`"venue_name":"([^"]*)"`:        "venue_name",
		`"venue_address":"([^"]*)"`:     "venue_address",
	}

	for pattern, key := range patterns {
		re := regexp.MustCompile(pattern)
		if matches := re.FindStringSubmatch(html); len(matches) > 1 {
			value := strings.TrimSpace(matches[1])
			if key == "organizer_name" && metadata.OrganizerName == "" {
				metadata.OrganizerName = value
			} else {
				metadata.ExtraData[key] = value
			}
		}
	}
}