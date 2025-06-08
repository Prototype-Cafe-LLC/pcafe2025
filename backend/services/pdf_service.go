package services

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// PDFService handles PDF text extraction operations
type PDFService struct {
	client *http.Client
}

// PDFExtractResult represents the result of PDF text extraction
type PDFExtractResult struct {
	Text          string            `json:"text"`
	PageCount     int               `json:"page_count"`
	ExtractedData map[string]string `json:"extracted_data,omitempty"`
	Metadata      map[string]string `json:"metadata,omitempty"`
}

func NewPDFService() *PDFService {
	return &PDFService{
		client: &http.Client{
			Timeout: 60 * time.Second, // PDF processing can take time
		},
	}
}

// ExtractTextFromPDF extracts text from a PDF file
// For production, this would integrate with libraries like:
// - github.com/ledongthuc/pdf (Go PDF library)
// - pdftotext command-line tool
// - Cloud services like AWS Textract, Google Document AI
func (p *PDFService) ExtractTextFromPDF(pdfData []byte) (*PDFExtractResult, error) {
	// Validate PDF data
	if !isPDFData(pdfData) {
		return nil, fmt.Errorf("invalid PDF data")
	}

	// For demonstration purposes, this is a mock implementation
	// In production, you would integrate with an actual PDF processing library
	result := &PDFExtractResult{
		Text:          "",
		PageCount:     1,
		ExtractedData: make(map[string]string),
		Metadata:      make(map[string]string),
	}

	// TODO: Integrate with actual PDF text extraction
	// Options for PDF text extraction:
	// 1. github.com/ledongthuc/pdf (pure Go)
	// 2. github.com/unidoc/unipdf (commercial Go library)
	// 3. pdftotext command-line tool (part of poppler-utils)
	// 4. AWS Textract or Google Document AI (cloud services)

	// Mock implementation for development
	if len(pdfData) > 0 {
		result.Text = "Mock PDF extraction result - Event details would be extracted here\n\nIoT Workshop 2025\nDate: January 15, 2025\nTime: 7:00 PM - 9:00 PM\nLocation: Shibuya Tech Center\nOrganizer: Tokyo IoT Group\n\nThis workshop will cover the latest trends in IoT development..."
		result.PageCount = 2

		// Mock extracted event data
		result.ExtractedData["title"] = "IoT Workshop 2025"
		result.ExtractedData["date"] = "January 15, 2025"
		result.ExtractedData["time"] = "7:00 PM - 9:00 PM"
		result.ExtractedData["location"] = "Shibuya Tech Center"
		result.ExtractedData["organizer"] = "Tokyo IoT Group"

		// Mock metadata
		result.Metadata["creator"] = "Event Management System"
		result.Metadata["creation_date"] = "2024-12-01"
	}

	return result, nil
}

// ExtractTextFromBase64PDF processes a base64 encoded PDF
func (p *PDFService) ExtractTextFromBase64PDF(base64Data string) (*PDFExtractResult, error) {
	// Parse data URL if present (data:application/pdf;base64,...)
	if strings.HasPrefix(base64Data, "data:") {
		parts := strings.SplitN(base64Data, ",", 2)
		if len(parts) != 2 {
			return nil, fmt.Errorf("invalid data URL format")
		}
		base64Data = parts[1]
	}

	// Decode base64 data
	pdfData, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64 PDF: %w", err)
	}

	return p.ExtractTextFromPDF(pdfData)
}

// ExtractTextFromURL downloads and processes a PDF from a URL
func (p *PDFService) ExtractTextFromURL(pdfURL string) (*PDFExtractResult, error) {
	// Download PDF
	resp, err := p.client.Get(pdfURL)
	if err != nil {
		return nil, fmt.Errorf("failed to download PDF: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error downloading PDF: %d", resp.StatusCode)
	}

	// Verify content type
	contentType := resp.Header.Get("Content-Type")
	if !strings.Contains(contentType, "application/pdf") {
		return nil, fmt.Errorf("invalid content type: %s", contentType)
	}

	// Read PDF data
	pdfData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read PDF data: %w", err)
	}

	return p.ExtractTextFromPDF(pdfData)
}

// ExtractEventInfoFromPDFText attempts to extract event information from PDF text
func (p *PDFService) ExtractEventInfoFromPDFText(text string) map[string]string {
	result := make(map[string]string)

	// This would contain sophisticated text parsing logic
	// For extracting event information from PDF text

	lines := strings.Split(text, "\n")

	for i, line := range lines {
		line = strings.TrimSpace(line)

		// Look for common event patterns
		if strings.Contains(strings.ToLower(line), "workshop") ||
			strings.Contains(strings.ToLower(line), "seminar") ||
			strings.Contains(strings.ToLower(line), "conference") ||
			strings.Contains(line, "勉強会") ||
			strings.Contains(line, "セミナー") {
			result["event_type"] = "workshop"
			// Often the title is on the same line or nearby
			if len(line) > 10 && result["title"] == "" {
				result["title"] = line
			}
		}

		// Look for date patterns
		if containsDatePattern(line) {
			result["extracted_date"] = line
		}

		// Look for time patterns
		if containsTimePattern(line) {
			result["extracted_time"] = line
		}

		// Look for location indicators
		if strings.Contains(strings.ToLower(line), "location") ||
			strings.Contains(strings.ToLower(line), "venue") ||
			strings.Contains(line, "場所") ||
			strings.Contains(line, "会場") {
			// Location might be on the same line or the next line
			if strings.Contains(line, ":") {
				parts := strings.SplitN(line, ":", 2)
				if len(parts) == 2 {
					result["location"] = strings.TrimSpace(parts[1])
				}
			} else if i+1 < len(lines) {
				result["location"] = strings.TrimSpace(lines[i+1])
			}
		}

		// Look for organizer information
		if strings.Contains(strings.ToLower(line), "organizer") ||
			strings.Contains(strings.ToLower(line), "organized by") ||
			strings.Contains(line, "主催") ||
			strings.Contains(line, "運営") {
			if strings.Contains(line, ":") {
				parts := strings.SplitN(line, ":", 2)
				if len(parts) == 2 {
					result["organizer"] = strings.TrimSpace(parts[1])
				}
			} else if i+1 < len(lines) {
				result["organizer"] = strings.TrimSpace(lines[i+1])
			}
		}
	}

	return result
}

// isPDFData checks if the data appears to be a valid PDF
func isPDFData(data []byte) bool {
	if len(data) < 5 {
		return false
	}

	// Check for PDF magic bytes
	return bytes.HasPrefix(data, []byte("%PDF-"))
}

// containsDatePattern checks if a line contains date-like patterns
func containsDatePattern(line string) bool {
	line = strings.ToLower(line)

	// Common date indicators
	dateKeywords := []string{
		"date:", "日時:", "開催日:", "when:",
		"january", "february", "march", "april", "may", "june",
		"july", "august", "september", "october", "november", "december",
		"月", "日", "年",
	}

	for _, keyword := range dateKeywords {
		if strings.Contains(line, keyword) {
			return true
		}
	}

	// Check for date patterns like 2025-01-15, 01/15/2025, etc.
	// This is a simplified check - in production you'd use regex
	if strings.Contains(line, "2025") || strings.Contains(line, "2024") {
		return true
	}

	return false
}

// containsTimePattern checks if a line contains time-like patterns
func containsTimePattern(line string) bool {
	line = strings.ToLower(line)

	// Common time indicators
	timeKeywords := []string{
		"time:", "時間:", "開始:", "start:", "pm", "am",
		":", "時", "分",
	}

	for _, keyword := range timeKeywords {
		if strings.Contains(line, keyword) {
			return true
		}
	}

	return false
}

// PDFToTextCommand implements PDF text extraction using pdftotext command
// This would require pdftotext to be installed on the server
type PDFToTextCommand struct{}

func NewPDFToTextCommand() *PDFToTextCommand {
	return &PDFToTextCommand{}
}

func (p *PDFToTextCommand) ExtractText(pdfPath string) (*PDFExtractResult, error) {
	// pdftotext command-line integration would go here
	// Example: pdftotext -layout input.pdf output.txt

	// This would require:
	// 1. pdftotext installed on server (part of poppler-utils)
	// 2. Proper command execution and output reading
	// 3. Error handling for different PDF types

	return &PDFExtractResult{
		Text:          "Mock pdftotext result",
		PageCount:     1,
		ExtractedData: make(map[string]string),
		Metadata:      make(map[string]string),
	}, nil
}

// UnidocPDFExtractor implements PDF text extraction using UniDoc library
// This would require the commercial UniDoc library
type UnidocPDFExtractor struct{}

func NewUnidocPDFExtractor() *UnidocPDFExtractor {
	return &UnidocPDFExtractor{}
}

func (u *UnidocPDFExtractor) ExtractText(pdfData []byte) (*PDFExtractResult, error) {
	// UniDoc PDF library integration would go here
	// This requires a commercial license for production use

	return &PDFExtractResult{
		Text:          "Mock UniDoc result",
		PageCount:     1,
		ExtractedData: make(map[string]string),
		Metadata:      make(map[string]string),
	}, nil
}
