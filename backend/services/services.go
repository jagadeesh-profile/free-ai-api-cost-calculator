package services

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// AuthService handles authentication
type AuthService struct {
	jwtSecret string
}

func NewAuthService(jwtSecret string) *AuthService {
	return &AuthService{jwtSecret: jwtSecret}
}

// HashPassword hashes a password using bcrypt
func (s *AuthService) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// VerifyPassword checks if a password matches the hash
func (s *AuthService) VerifyPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

// Claims defines JWT claims
type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// GenerateToken creates a JWT token
func (s *AuthService) GenerateToken(userID, email string, expiresIn time.Duration) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// CostCalculationService handles cost calculations
type CostCalculation struct {
	Provider  string  `json:"provider"`
	Tokens    float64 `json:"tokens"`
	Rate      float64 `json:"rate"` // per 1000 tokens
	Cost      float64 `json:"cost"`
}

type CostCalculationResult struct {
	TotalCost float64              `json:"total_cost"`
	Items     []CostCalculation    `json:"items"`
	Breakdown map[string]float64   `json:"breakdown"`
	Timestamp time.Time            `json:"timestamp"`
}

type CostCalculationService struct{}

func NewCostCalculationService() *CostCalculationService {
	return &CostCalculationService{}
}

// CalculateCost calculates costs from usage data
func (s *CostCalculationService) CalculateCost(items []CostCalculation) *CostCalculationResult {
	var totalCost float64
	breakdown := make(map[string]float64)

	for i := range items {
		// Cost = (Tokens / 1000) * Rate
		itemCost := (items[i].Tokens / 1000.0) * items[i].Rate
		items[i].Cost = math.Round(itemCost*100) / 100 // Round to 2 decimals

		totalCost += items[i].Cost

		// Add to breakdown by provider
		breakdown[items[i].Provider] += items[i].Cost
	}

	// Round total
	totalCost = math.Round(totalCost*100) / 100

	return &CostCalculationResult{
		TotalCost: totalCost,
		Items:     items,
		Breakdown: breakdown,
		Timestamp: time.Now(),
	}
}

// ProviderRates defines default rates by provider
var ProviderRates = map[string]map[string]float64{
	"OpenAI": {
		"gpt-4":      0.03,
		"gpt-3.5":    0.0005,
		"gpt-4-vision": 0.01,
	},
	"Anthropic": {
		"claude":      0.01163,
		"claude-instant": 0.00581,
	},
	"Cohere": {
		"default": 0.005,
	},
}

// GetProviderRate gets the rate for a provider/model
func (s *CostCalculationService) GetProviderRate(provider, model string) float64 {
	if rates, ok := ProviderRates[provider]; ok {
		if rate, ok := rates[model]; ok {
			return rate
		}
		// Return first/default rate if model not found
		for _, rate := range rates {
			return rate
		}
	}
	return 0
}

// OrganizationService handles organization logic
type OrganizationService struct{}

func NewOrganizationService() *OrganizationService {
	return &OrganizationService{}
}

// ValidatePlan validates an organization plan
func (s *OrganizationService) ValidatePlan(plan string) bool {
	validPlans := map[string]bool{"free": true, "pro": true, "enterprise": true}
	return validPlans[plan]
}

// GetPlanLimits returns limits for a plan
func (s *OrganizationService) GetPlanLimits(plan string) map[string]interface{} {
	limits := map[string]map[string]interface{}{
		"free": {
			"api_calls_per_month":  10000,
			"team_members":         1,
			"api_keys":             1,
			"storage_gb":           1,
		},
		"pro": {
			"api_calls_per_month":  1000000,
			"team_members":         10,
			"api_keys":             5,
			"storage_gb":           100,
		},
		"enterprise": {
			"api_calls_per_month":  -1, // unlimited
			"team_members":         -1,
			"api_keys":             -1,
			"storage_gb":           -1,
		},
	}

	if l, ok := limits[plan]; ok {
		return l
	}
	return limits["free"]
}

// AnalyticsService handles analytics calculations
type AnalyticsService struct{}

func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{}
}

// CalculateMonthlyTrend calculates cost trends
type MonthlyCost struct {
	Month    string  `json:"month"`
	Provider string  `json:"provider"`
	Cost     float64 `json:"cost"`
}

func (s *AnalyticsService) CalculateCostTrend(costs []CostCalculation) map[string]float64 {
	trend := make(map[string]float64)

	for _, cost := range costs {
		month := cost.CreatedAt.Format("2006-01")
		if _, ok := trend[month]; !ok {
			trend[month] = 0
		}
		trend[month] += cost.Cost
	}

	return trend
}

// Validation service
type ValidationService struct{}

func NewValidationService() *ValidationService {
	return &ValidationService{}
}

// ValidateEmail validates email format
func (s *ValidationService) ValidateEmail(email string) error {
	if len(email) < 5 || len(email) > 255 {
		return errors.New("invalid email length")
	}
	if email[len(email)-4:] != ".com" && email[len(email)-3:] != ".io" && email[len(email)-4:] != ".org" {
		// Simple validation
		return errors.New("invalid email format")
	}
	return nil
}

// ValidatePassword validates password strength
func (s *ValidationService) ValidatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	return nil
}

// Encryption service
type EncryptionService struct {
	key []byte
}

func NewEncryptionService() *EncryptionService {
	// Use environment variable or default key (change in production!)
	keyString := os.Getenv("ENCRYPTION_KEY")
	if keyString == "" {
		keyString = "32-byte-key-for-aes256-change-this!!" // 32 bytes for AES-256
	}
	// Ensure key is exactly 32 bytes
	key := []byte(keyString)
	if len(key) < 32 {
		// Pad with zeros if too short
		key = append(key, make([]byte, 32-len(key))...)
	} else if len(key) > 32 {
		// Truncate if too long
		key = key[:32]
	}
	return &EncryptionService{key: key}
}

// EncryptAPIKey encrypts an API key using AES-256-GCM
func (s *EncryptionService) EncryptAPIKey(apiKey string) string {
	block, err := aes.NewCipher(s.key)
	if err != nil {
		return apiKey // Fallback: return plain if encryption fails
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return apiKey
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return apiKey
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(apiKey), nil)
	return base64.StdEncoding.EncodeToString(ciphertext)
}

// DecryptAPIKey decrypts an API key using AES-256-GCM
func (s *EncryptionService) DecryptAPIKey(encryptedKey string) string {
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedKey)
	if err != nil {
		return "" // Decryption failed
	}

	block, err := aes.NewCipher(s.key)
	if err != nil {
		return ""
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return ""
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "" // Invalid ciphertext
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "" // Decryption failed
	}

	return string(plaintext)
}
