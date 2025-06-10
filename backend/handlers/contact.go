package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pcafe/pcafe2025/db"
	"github.com/pcafe/pcafe2025/models"
	"github.com/pcafe/pcafe2025/services"
)

// ContactHandler handles contact form submissions
type ContactHandler struct {
	emailService     *services.EmailService
	turnstileService *services.TurnstileService
}

func NewContactHandler(emailService *services.EmailService, turnstileService *services.TurnstileService) *ContactHandler {
	return &ContactHandler{
		emailService:     emailService,
		turnstileService: turnstileService,
	}
}

// SubmitContactForm handles POST /api/contact
// @Summary Submit contact form
// @Description Submit a contact form with Turnstile CAPTCHA verification
// @Tags Contact
// @Accept json
// @Produce json
// @Param input body models.ContactSubmissionInput true "Contact form data"
// @Success 201 {object} map[string]interface{} "Contact submission created"
// @Failure 400 {object} map[string]string "Bad request or invalid CAPTCHA"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /contact [post]
func (h *ContactHandler) SubmitContactForm(c *gin.Context) {
	var input models.ContactSubmissionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify Turnstile token
	isValid, err := h.turnstileService.VerifyToken(input.TurnstileToken, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify CAPTCHA"})
		return
	}

	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid CAPTCHA verification"})
		return
	}

	// Create contact submission
	submission := models.ContactSubmission{
		Name:              input.Name,
		Email:             input.Email,
		Phone:             input.Phone,
		Company:           input.Company,
		Subject:           input.Subject,
		Message:           input.Message,
		FormType:          input.FormType,
		Source:            c.GetHeader("Referer"),
		IPAddress:         c.ClientIP(),
		UserAgent:         c.GetHeader("User-Agent"),
		TurnstileToken:    input.TurnstileToken,
		TurnstileVerified: true,
		Status:            "new",
		IsSpam:            false,
	}

	// Save to database
	db := db.GetDB()
	if err := db.Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save contact submission"})
		return
	}

	// Send notification email to admin
	if err := h.emailService.SendContactEmail(&submission); err != nil {
		// Log error but don't fail the request
		// The submission is already saved to database
		// TODO: Add proper logging
		c.Header("X-Email-Warning", "Failed to send notification email")
	}

	// Send confirmation email to submitter
	if err := h.emailService.SendContactConfirmationEmail(&submission); err != nil {
		// Log error but don't fail the request
		c.Header("X-Confirmation-Warning", "Failed to send confirmation email")
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Contact form submitted successfully",
		"id":      submission.ID,
	})
}

// GetContactSubmissions handles GET /api/contact (admin only)
func (h *ContactHandler) GetContactSubmissions(c *gin.Context) {

	var submissions []models.ContactSubmission
	db := db.GetDB()

	// Apply filters
	query := db.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if isSpam := c.Query("is_spam"); isSpam != "" {
		query = query.Where("is_spam = ?", isSpam == "true")
	}

	// Pagination
	limit := 50
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := 0
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	query = query.Limit(limit).Offset(offset)

	if err := query.Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, submissions)
}

// UpdateContactSubmission handles PUT /api/contact/{id} (admin only)
func (h *ContactHandler) UpdateContactSubmission(c *gin.Context) {

	id := c.Param("id")

	var input models.ContactSubmissionUpdate
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var submission models.ContactSubmission
	db := db.GetDB()

	if err := db.First(&submission, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact submission not found"})
		return
	}

	// Update fields
	submission.Status = input.Status
	submission.IsSpam = input.IsSpam
	submission.AdminNotes = input.AdminNotes
	submission.ResponseSent = input.ResponseSent

	if input.Status != "new" && submission.ProcessedAt == nil {
		now := time.Now()
		submission.ProcessedAt = &now
	}

	if input.ResponseSent && submission.ResponseSentAt == nil {
		now := time.Now()
		submission.ResponseSentAt = &now
	}

	if err := db.Save(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, submission)
}
