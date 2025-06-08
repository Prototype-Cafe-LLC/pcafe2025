package services

import (
	"bytes"
	"html"
	"strings"

	"github.com/microcosm-cc/bluemonday"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	goldmarkhtml "github.com/yuin/goldmark/renderer/html"
)

// ContentService handles content processing for blog posts
type ContentService struct {
	markdownRenderer goldmark.Markdown
	htmlSanitizer    *bluemonday.Policy
}

// NewContentService creates a new content service with configured Markdown and HTML sanitization
func NewContentService() *ContentService {
	// Configure Markdown renderer with syntax highlighting and table support
	md := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,   // GitHub Flavored Markdown
			extension.Table, // Table support
			extension.Strikethrough,
			extension.Linkify,  // Auto-link URLs
			extension.TaskList, // Task lists
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(), // Auto-generate heading IDs
		),
		goldmark.WithRendererOptions(
			goldmarkhtml.WithHardWraps(),
			goldmarkhtml.WithXHTML(),
		),
	)

	// Configure HTML sanitizer policy - allow most common blog elements
	policy := bluemonday.UGCPolicy()

	// Allow additional elements for rich blog content
	policy.AllowElements("h1", "h2", "h3", "h4", "h5", "h6")
	policy.AllowElements("pre", "code")
	policy.AllowElements("table", "thead", "tbody", "tr", "th", "td")
	policy.AllowElements("dl", "dt", "dd")
	policy.AllowElements("figure", "figcaption")

	// Allow attributes for syntax highlighting and styling
	policy.AllowAttrs("class").OnElements("code", "pre", "span", "div")
	policy.AllowAttrs("id").OnElements("h1", "h2", "h3", "h4", "h5", "h6")

	// Allow data attributes for enhanced functionality
	policy.AllowDataAttributes()

	return &ContentService{
		markdownRenderer: md,
		htmlSanitizer:    policy,
	}
}

// ProcessContent takes raw content and content type, returns processed HTML
func (cs *ContentService) ProcessContent(content, contentType string) (string, error) {
	switch strings.ToLower(contentType) {
	case "markdown", "md":
		return cs.processMarkdown(content)
	case "html":
		return cs.sanitizeHTML(content), nil
	default:
		// Default to markdown processing
		return cs.processMarkdown(content)
	}
}

// processMarkdown converts markdown to sanitized HTML
func (cs *ContentService) processMarkdown(markdown string) (string, error) {
	var buf bytes.Buffer

	if err := cs.markdownRenderer.Convert([]byte(markdown), &buf); err != nil {
		return "", err
	}

	// Sanitize the generated HTML
	html := cs.htmlSanitizer.Sanitize(buf.String())
	return html, nil
}

// sanitizeHTML cleans HTML content using bluemonday policy
func (cs *ContentService) sanitizeHTML(htmlContent string) string {
	return cs.htmlSanitizer.Sanitize(htmlContent)
}

// ExtractPlainText extracts plain text from content for excerpts
func (cs *ContentService) ExtractPlainText(content, contentType string) (string, error) {
	processedHTML, err := cs.ProcessContent(content, contentType)
	if err != nil {
		return "", err
	}

	// Strip HTML tags and decode entities
	plainText := bluemonday.StrictPolicy().Sanitize(processedHTML)
	plainText = html.UnescapeString(plainText)

	// Clean up whitespace
	plainText = strings.TrimSpace(plainText)
	plainText = strings.ReplaceAll(plainText, "\n\n", " ")
	plainText = strings.ReplaceAll(plainText, "\n", " ")

	return plainText, nil
}

// GenerateExcerpt creates an excerpt from content with specified length
func (cs *ContentService) GenerateExcerpt(content, contentType string, maxLength int) (string, error) {
	plainText, err := cs.ExtractPlainText(content, contentType)
	if err != nil {
		return "", err
	}

	if len(plainText) <= maxLength {
		return plainText, nil
	}

	// Find the last space before maxLength to avoid cutting words
	excerpt := plainText[:maxLength]
	if lastSpace := strings.LastIndex(excerpt, " "); lastSpace > maxLength-50 {
		excerpt = excerpt[:lastSpace]
	}

	return excerpt + "...", nil
}

// ValidateContentType checks if the content type is supported
func (cs *ContentService) ValidateContentType(contentType string) bool {
	switch strings.ToLower(contentType) {
	case "markdown", "md", "html":
		return true
	default:
		return false
	}
}
