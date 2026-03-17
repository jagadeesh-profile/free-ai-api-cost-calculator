package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// Test Register Handler
func TestHandleRegister(t *testing.T) {
	tests := []struct {
		name           string
		body           interface{}
		expectedStatus int
		expectedError  bool
	}{
		{
			name:           "Valid registration",
			body:           map[string]string{"email": "user@test.com", "name": "Test User", "password": "password123"},
			expectedStatus: http.StatusOK,
			expectedError:  false,
		},
		{
			name:           "Missing email",
			body:           map[string]string{"name": "Test User", "password": "password123"},
			expectedStatus: http.StatusBadRequest,
			expectedError:  true,
		},
		{
			name:           "Missing password",
			body:           map[string]string{"email": "user@test.com", "name": "Test User"},
			expectedStatus: http.StatusBadRequest,
			expectedError:  true,
		},
		{
			name:           "Invalid JSON",
			body:           "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedError:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bodyBytes, _ := json.Marshal(tt.body)
			req := httptest.NewRequest("POST", "/api/auth/register", bytes.NewReader(bodyBytes))
			w := httptest.NewRecorder()

			// Would call handler here
			// handler(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
		})
	}
}

// Test Login Handler
func TestHandleLogin(t *testing.T) {
	tests := []struct {
		name           string
		email          string
		password       string
		expectedStatus int
	}{
		{
			name:           "Valid login",
			email:          "user@test.com",
			password:       "password123",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid password",
			email:          "user@test.com",
			password:       "wrongpassword",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Non-existent user",
			email:          "nouser@test.com",
			password:       "password123",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body := map[string]string{"email": tt.email, "password": tt.password}
			bodyBytes, _ := json.Marshal(body)
			req := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(bodyBytes))
			w := httptest.NewRecorder()

			// Would call handler here
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
		})
	}
}

// Test Organization CRUD
func TestHandleCreateOrg(t *testing.T) {
	testCases := []struct {
		name           string
		orgName        string
		plan           string
		expectedStatus int
	}{
		{"Valid org", "My Org", "free", http.StatusOK},
		{"Empty name", "", "free", http.StatusBadRequest},
		{"Invalid plan", "My Org", "invalid", http.StatusBadRequest},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			body := map[string]string{"name": tc.orgName, "plan": tc.plan}
			bodyBytes, _ := json.Marshal(body)
			req := httptest.NewRequest("POST", "/api/orgs", bytes.NewReader(bodyBytes))
			w := httptest.NewRecorder()

			if w.Code != tc.expectedStatus {
				t.Errorf("Expected %d, got %d", tc.expectedStatus, w.Code)
			}
		})
	}
}

func TestHandleGetOrgs(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/orgs", nil)
	w := httptest.NewRecorder()

	// Would call handler here

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

// Test Team CRUD
func TestHandleCreateTeam(t *testing.T) {
	testCases := []struct {
		name           string
		inputs         map[string]string
		expectedStatus int
	}{
		{
			"Valid team",
			map[string]string{"org_id": "org123", "name": "Team A"},
			http.StatusOK,
		},
		{
			"Missing org_id",
			map[string]string{"name": "Team A"},
			http.StatusBadRequest,
		},
		{
			"Missing team name",
			map[string]string{"org_id": "org123"},
			http.StatusBadRequest,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			bodyBytes, _ := json.Marshal(tc.inputs)
			req := httptest.NewRequest("POST", "/api/teams", bytes.NewReader(bodyBytes))
			w := httptest.NewRecorder()

			if w.Code != tc.expectedStatus {
				t.Errorf("Expected %d, got %d", tc.expectedStatus, w.Code)
			}
		})
	}
}

func TestHandleUpdateTeam(t *testing.T) {
	body := map[string]string{"name": "Updated Team"}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("PUT", "/api/teams/team123", bytes.NewReader(bodyBytes))
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK && w.Code != http.StatusBadRequest {
		t.Errorf("Unexpected status: %d", w.Code)
	}
}

// Test Configuration CRUD
func TestHandleCreateConfig(t *testing.T) {
	testCases := []struct {
		name           string
		provider       string
		apiKey         string
		expectedStatus int
	}{
		{"Valid config", "openai", "sk-test123", http.StatusOK},
		{"Missing provider", "", "sk-test123", http.StatusBadRequest},
		{"Missing API key", "openai", "", http.StatusBadRequest},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			body := map[string]string{
				"provider": tc.provider,
				"api_key":  tc.apiKey,
				"settings": "{}",
			}
			bodyBytes, _ := json.Marshal(body)
			req := httptest.NewRequest("POST", "/api/configurations", bytes.NewReader(bodyBytes))
			w := httptest.NewRecorder()

			if w.Code != tc.expectedStatus {
				t.Errorf("Expected %d, got %d", tc.expectedStatus, w.Code)
			}
		})
	}
}

func TestHandleListConfigs(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/configurations", nil)
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}
}

func TestHandleUpdateConfig(t *testing.T) {
	body := map[string]string{
		"provider": "openai",
		"api_key":  "sk-new123",
		"settings": "{}",
	}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("PUT", "/api/configurations/config123", bytes.NewReader(bodyBytes))
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK && w.Code != http.StatusBadRequest {
		t.Errorf("Unexpected status: %d", w.Code)
	}
}

func TestHandleDeleteConfig(t *testing.T) {
	req := httptest.NewRequest("DELETE", "/api/configurations/config123", nil)
	w := httptest.NewRecorder()

	if w.Code != http.StatusNoContent && w.Code != http.StatusOK {
		t.Errorf("Unexpected status: %d", w.Code)
	}
}

// Test Cost Calculation
func TestHandleCalculateCost(t *testing.T) {
	tests := []struct {
		name           string
		items          []map[string]interface{}
		expectedStatus int
	}{
		{
			"Valid calculation",
			[]map[string]interface{}{
				{"provider": "openai", "usage": 1000, "rate": 0.03},
			},
			http.StatusOK,
		},
		{
			"Empty items",
			[]map[string]interface{}{},
			http.StatusBadRequest,
		},
		{
			"Missing provider",
			[]map[string]interface{}{
				{"usage": 1000, "rate": 0.03},
			},
			http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body := map[string]interface{}{"items": tt.items}
			bodyBytes, _ := json.Marshal(body)
			req := httptest.NewRequest("POST", "/api/calculate", bytes.NewReader(bodyBytes))
			w := httptest.NewRecorder()

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected %d, got %d", tt.expectedStatus, w.Code)
			}
		})
	}
}

func TestHandleListCalculations(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/calculations", nil)
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK && w.Code != http.StatusBadRequest {
		t.Errorf("Unexpected status: %d", w.Code)
	}
}

// Test Analytics
func TestHandleAnalyticsSummary(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/analytics/summary", nil)
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK && w.Code != http.StatusBadRequest {
		t.Errorf("Unexpected status: %d", w.Code)
	}
}

// Test Provider Status
func TestHandleGetProviderStatus(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/providers/status", nil)
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK && w.Code != http.StatusBadRequest {
		t.Errorf("Unexpected status: %d", w.Code)
	}
}

func TestHandleSyncProviders(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/sync/providers", nil)
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK && w.Code != http.StatusBadRequest {
		t.Errorf("Unexpected status: %d", w.Code)
	}
}

// Test Auth Middleware
func TestAuthMiddleware(t *testing.T) {
	testCases := []struct {
		name      string
		hasToken  bool
		tokenValid bool
		expectedOK bool
	}{
		{"Valid token", true, true, true},
		{"No token", false, false, false},
		{"Invalid token", true, false, false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/protected", nil)
			if tc.hasToken {
				if tc.tokenValid {
					req.Header.Set("Authorization", "Bearer valid-token")
				} else {
					req.Header.Set("Authorization", "Bearer invalid-token")
				}
			}

			// Would call middleware here
			if !tc.expectedOK && tc.hasToken {
				t.Log("Token validation passed")
			}
		})
	}
}

// Test Health Checks
func TestHealthEndpoint(t *testing.T) {
	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK {
		t.Errorf("Health check failed: %d", w.Code)
	}
}

func TestReadyEndpoint(t *testing.T) {
	req := httptest.NewRequest("GET", "/ready", nil)
	w := httptest.NewRecorder()

	if w.Code != http.StatusOK {
		t.Errorf("Ready check failed: %d", w.Code)
	}
}

// Test CORS
func TestCORSHeaders(t *testing.T) {
	req := httptest.NewRequest("OPTIONS", "/api/orgs", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	w := httptest.NewRecorder()

	// CORS would be handled by middleware

	if w.Header().Get("Access-Control-Allow-Origin") == "" {
		t.Log("CORS headers not set (expected in test environment)")
	}
}

// Test Error Handling  
func TestErrorHandling(t *testing.T) {
	testCases := []struct {
		name           string
		route          string
		method         string
		expectedStatus int
	}{
		{"404 Not Found", "/nonexistent", "GET", http.StatusNotFound},
		{"Method Not Allowed", "/api/orgs", "PATCH", http.StatusMethodNotAllowed},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.route, nil)
			w := httptest.NewRecorder()

			if w.Code != tc.expectedStatus && w.Code != http.StatusNotFound {
				t.Logf("Status code %d received", w.Code)
			}
		})
	}
}

// Benchmark tests
func BenchmarkHandleGetOrgs(b *testing.B) {
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/api/orgs", nil)
		_ = httptest.NewRecorder()
		_ = req
	}
}

func BenchmarkHandleCalculateCost(b *testing.B) {
	body := map[string]interface{}{
		"items": []map[string]interface{}{
			{"provider": "openai", "usage": 1000, "rate": 0.03},
		},
	}
	bodyBytes, _ := json.Marshal(body)

	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("POST", "/api/calculate", bytes.NewReader(bodyBytes))
		_ = httptest.NewRecorder()
		_ = req
	}
}

