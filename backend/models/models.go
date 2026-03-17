package models

import (
	"time"
)

// User represents an authenticated user
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Organization represents a company/account
type Organization struct {
	ID        string    `json:"id"`
	OwnerID   string    `json:"owner_id"`
	Name      string    `json:"name"`
	Plan      string    `json:"plan"` // free, pro, enterprise
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Team represents a team within an organization
type Team struct {
	ID    string `json:"id"`
	OrgID string `json:"org_id"`
	Name  string `json:"name"`
	Role  string `json:"role"` // admin, member, viewer
}

// Configuration stores provider API keys and settings
type Configuration struct {
	ID        string    `json:"id"`
	OrgID     string    `json:"org_id"`
	Provider  string    `json:"provider"` // openai, anthropic, etc
	APIKey    string    `json:"-"`
	Settings  string    `json:"settings"` // JSON
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CostCalculation represents a cost calculation request
type CostCalculation struct {
	ID         string    `json:"id"`
	OrgID      string    `json:"org_id"`
	Provider   string    `json:"provider"`
	UsageData  string    `json:"usage_data"` // JSON
	TotalCost  float64   `json:"total_cost"`
	Breakdown  string    `json:"breakdown"` // JSON
	CreatedAt  time.Time `json:"created_at"`
}

// ProviderStatus tracks provider API connectivity
type ProviderStatus struct {
	Provider  string    `json:"provider"`
	Status    string    `json:"status"` // connected, error, disconnected
	LastSync  time.Time `json:"last_sync"`
	NextSync  time.Time `json:"next_sync"`
	ErrorMsg  string    `json:"error_msg,omitempty"`
}
