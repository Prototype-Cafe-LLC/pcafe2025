package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type TurnstileService struct {
	SecretKey string
}

type TurnstileResponse struct {
	Success     bool      `json:"success"`
	ChallengeTS time.Time `json:"challenge_ts"`
	Hostname    string    `json:"hostname"`
	ErrorCodes  []string  `json:"error-codes"`
}

func NewTurnstileService(secretKey string) *TurnstileService {
	return &TurnstileService{
		SecretKey: secretKey,
	}
}

// VerifyToken verifies a Cloudflare Turnstile token
func (t *TurnstileService) VerifyToken(token, clientIP string) (bool, error) {
	if t.SecretKey == "" {
		return false, fmt.Errorf("Turnstile secret key not configured")
	}

	// Prepare request data
	data := map[string]string{
		"secret":   t.SecretKey,
		"response": token,
		"remoteip": clientIP,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return false, fmt.Errorf("failed to marshal request data: %w", err)
	}

	// Make request to Turnstile API
	resp, err := http.Post(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return false, fmt.Errorf("failed to verify Turnstile token: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var turnstileResp TurnstileResponse
	if err := json.NewDecoder(resp.Body).Decode(&turnstileResp); err != nil {
		return false, fmt.Errorf("failed to decode Turnstile response: %w", err)
	}

	return turnstileResp.Success, nil
}