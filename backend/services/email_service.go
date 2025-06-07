package services

import (
	"fmt"
	"net/smtp"
	"strings"
	"time"

	"github.com/pcafe/pcafe2025/models"
)

type EmailService struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
}

func NewEmailService(smtpHost, smtpPort, smtpUsername, smtpPassword, fromEmail string) *EmailService {
	return &EmailService{
		SMTPHost:     smtpHost,
		SMTPPort:     smtpPort,
		SMTPUsername: smtpUsername,
		SMTPPassword: smtpPassword,
		FromEmail:    fromEmail,
	}
}

// SendContactEmail sends contact form submission to the configured email
func (e *EmailService) SendContactEmail(submission *models.ContactSubmission) error {
	toEmail := "yuki.kikuchi+hp_contact@prototype-cafe.space"
	
	subject := fmt.Sprintf("[PCafe Contact] %s", submission.Subject)
	
	// Create email body
	body := e.createContactEmailBody(submission)
	
	// Prepare email message
	message := fmt.Sprintf("To: %s\r\n"+
		"Subject: %s\r\n"+
		"Content-Type: text/plain; charset=UTF-8\r\n"+
		"\r\n"+
		"%s", toEmail, subject, body)

	// Send email
	return e.sendEmail(toEmail, []byte(message))
}

// SendContactConfirmationEmail sends confirmation email to the contact form submitter
func (e *EmailService) SendContactConfirmationEmail(submission *models.ContactSubmission) error {
	subject := "[PCafe] お問い合わせありがとうございます / Thank you for your inquiry"
	
	// Create confirmation email body
	body := e.createConfirmationEmailBody(submission)
	
	// Prepare email message
	message := fmt.Sprintf("To: %s\r\n"+
		"Subject: %s\r\n"+
		"Content-Type: text/plain; charset=UTF-8\r\n"+
		"\r\n"+
		"%s", submission.Email, subject, body)

	// Send email
	return e.sendEmail(submission.Email, []byte(message))
}

func (e *EmailService) createContactEmailBody(submission *models.ContactSubmission) string {
	var body strings.Builder
	
	body.WriteString("PCafeウェブサイトからお問い合わせがありました。\n")
	body.WriteString("A new contact form submission has been received from the PCafe website.\n\n")
	
	body.WriteString("===== 送信者情報 / Sender Information =====\n")
	body.WriteString(fmt.Sprintf("お名前 / Name: %s\n", submission.Name))
	body.WriteString(fmt.Sprintf("メールアドレス / Email: %s\n", submission.Email))
	
	if submission.Phone != "" {
		body.WriteString(fmt.Sprintf("電話番号 / Phone: %s\n", submission.Phone))
	}
	
	if submission.Company != "" {
		body.WriteString(fmt.Sprintf("会社名 / Company: %s\n", submission.Company))
	}
	
	body.WriteString(fmt.Sprintf("フォーム種別 / Form Type: %s\n", submission.FormType))
	body.WriteString(fmt.Sprintf("送信日時 / Submitted At: %s (JST)\n", submission.CreatedAt.In(time.FixedZone("JST", 9*60*60)).Format("2006-01-02 15:04:05")))
	
	body.WriteString("\n===== お問い合わせ内容 / Inquiry Content =====\n")
	body.WriteString(fmt.Sprintf("件名 / Subject: %s\n\n", submission.Subject))
	body.WriteString(fmt.Sprintf("メッセージ / Message:\n%s\n", submission.Message))
	
	body.WriteString("\n===== 技術情報 / Technical Information =====\n")
	body.WriteString(fmt.Sprintf("IPアドレス / IP Address: %s\n", submission.IPAddress))
	body.WriteString(fmt.Sprintf("Turnstile検証 / Turnstile Verified: %t\n", submission.TurnstileVerified))
	
	if submission.UserAgent != "" {
		body.WriteString(fmt.Sprintf("User Agent: %s\n", submission.UserAgent))
	}
	
	body.WriteString("\n---\nPCafe 2025 Contact System")
	
	return body.String()
}

func (e *EmailService) createConfirmationEmailBody(submission *models.ContactSubmission) string {
	var body strings.Builder
	
	body.WriteString(fmt.Sprintf("%s様\n\n", submission.Name))
	body.WriteString("この度は、PCafeにお問い合わせいただき、ありがとうございます。\n")
	body.WriteString("以下の内容でお問い合わせを受け付けいたしました。\n\n")
	
	body.WriteString("Dear " + submission.Name + ",\n\n")
	body.WriteString("Thank you for contacting PCafe.\n")
	body.WriteString("We have received your inquiry with the following details:\n\n")
	
	body.WriteString("===== お問い合わせ内容 / Inquiry Details =====\n")
	body.WriteString(fmt.Sprintf("件名 / Subject: %s\n", submission.Subject))
	body.WriteString(fmt.Sprintf("送信日時 / Submitted At: %s (JST)\n\n", submission.CreatedAt.In(time.FixedZone("JST", 9*60*60)).Format("2006-01-02 15:04:05")))
	
	body.WriteString("メッセージ / Message:\n")
	body.WriteString(submission.Message + "\n\n")
	
	body.WriteString("---\n\n")
	body.WriteString("担当者より折り返しご連絡いたします。今しばらくお待ちください。\n")
	body.WriteString("Our team will get back to you shortly. Please wait for our response.\n\n")
	
	body.WriteString("※このメールは自動送信されています。このメールに返信されても回答できませんのでご了承ください。\n")
	body.WriteString("* This is an automated message. Please do not reply to this email.\n\n")
	
	body.WriteString("---\n")
	body.WriteString("PCafe\n")
	body.WriteString("https://www.prototype-cafe.space/\n")
	
	return body.String()
}

func (e *EmailService) sendEmail(to string, message []byte) error {
	// Create authentication
	auth := smtp.PlainAuth("", e.SMTPUsername, e.SMTPPassword, e.SMTPHost)
	
	// Send email
	addr := fmt.Sprintf("%s:%s", e.SMTPHost, e.SMTPPort)
	err := smtp.SendMail(addr, auth, e.FromEmail, []string{to}, message)
	if err != nil {
		return fmt.Errorf("failed to send email to %s: %w", to, err)
	}
	
	return nil
}

// ValidateEmailConfig checks if email service is properly configured
func (e *EmailService) ValidateEmailConfig() error {
	if e.SMTPHost == "" {
		return fmt.Errorf("SMTP host not configured")
	}
	if e.SMTPPort == "" {
		return fmt.Errorf("SMTP port not configured")
	}
	if e.FromEmail == "" {
		return fmt.Errorf("from email not configured")
	}
	return nil
}