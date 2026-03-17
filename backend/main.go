package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "github.com/lib/pq"
	"shaconnects/api-calculator/db"
	"shaconnects/api-calculator/services"
)

func main() {
	// Database connection
	databaseURL := getEnv("DATABASE_URL", "postgres://calculator:calculator123@localhost:5432/api_calculator?sslmode=disable")
	database, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer database.Close()

	// Test connection
	if err := database.Ping(); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}
	log.Println("Database connected successfully")

	// Initialize repositories
	userRepo := db.NewUserRepository(database)
	orgRepo := db.NewOrgRepository(database)
	teamRepo := db.NewTeamRepository(database)
	configRepo := db.NewConfigRepository(database)
	costRepo := db.NewCostRepository(database)

	// Initialize services
	jwtSecret := getEnv("JWT_SECRET", "dev-secret-key-change-in-production")
	authService := services.NewAuthService(jwtSecret)
	costCalcService := services.NewCostCalculationService()
	orgService := services.NewOrganizationService()
	analyticsService := services.NewAnalyticsService()
	validationService := services.NewValidationService()
	encryptionService := services.NewEncryptionService()

	// Initialize router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:80"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health checks
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"healthy"}`)
	})

	r.Get("/ready", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ready"}`)
	})

	// Routes
	r.Route("/api", func(r chi.Router) {
		// Auth routes (public)
		r.Post("/auth/register", handleRegister(userRepo, authService, validationService))
		r.Post("/auth/login", handleLogin(userRepo, authService))
		r.Post("/auth/refresh", handleRefresh(authService))

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware(authService))

			// Orgs
			r.Get("/orgs", handleGetOrgs(orgRepo, authService))
			r.Post("/orgs", handleCreateOrg(orgRepo, authService, orgService))
			r.Get("/orgs/{orgId}", handleGetOrg(orgRepo))
			r.Put("/orgs/{orgId}", handleUpdateOrg(orgRepo))

			// Teams
			r.Post("/orgs/{orgId}/teams", handleCreateTeam(teamRepo))
			r.Get("/orgs/{orgId}/teams", handleGetTeams(teamRepo))
			r.Put("/teams/{teamId}", handleUpdateTeam(teamRepo))

			// Configurations
			r.Post("/configurations", handleCreateConfig(configRepo, encryptionService))
			r.Get("/configurations", handleListConfigs(configRepo, authService))
			r.Get("/configurations/{configId}", handleGetConfig(configRepo))
			r.Put("/configurations/{configId}", handleUpdateConfig(configRepo))
			r.Delete("/configurations/{configId}", handleDeleteConfig(configRepo))

			// Cost Calculation
			r.Post("/calculate", handleCalculateCost(costRepo, costCalcService))
			r.Get("/calculations", handleListCalculations(costRepo, authService))

			// Analytics
			r.Get("/analytics/summary", handleAnalyticsSummary(costRepo, authService))

			// Provider Sync
			r.Post("/sync/providers", handleSyncProviders(configRepo))
			r.Get("/providers/status", handleGetProviderStatus(configRepo))
		})
	})

	// Start server
	srv := &http.Server{
		Addr:         ":" + getEnv("PORT", "8080"),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		srv.Shutdown(ctx)
	}()

	log.Printf("Server listening on %s", srv.Addr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("listen error: %v", err)
	}
}

// Handlers
type RegisterRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token  string `json:"token"`
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
}

func handleRegister(userRepo *db.UserRepository, authSvc *services.AuthService, valSvc *services.ValidationService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Validate
		if err := valSvc.ValidateEmail(req.Email); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := valSvc.ValidatePassword(req.Password); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Hash password
		hashedPassword, err := authSvc.HashPassword(req.Password)
		if err != nil {
			http.Error(w, "Registration failed", http.StatusInternalServerError)
			return
		}

		// Create user
		user, err := userRepo.CreateUser(req.Email, req.Name, hashedPassword)
		if err != nil {
			http.Error(w, "Email already exists", http.StatusConflict)
			return
		}

		// Generate token
		token, err := authSvc.GenerateToken(user.ID, user.Email, 24*time.Hour)
		if err != nil {
			http.Error(w, "Token generation failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(AuthResponse{
			Token:  token,
			UserID: user.ID,
			Email:  user.Email,
			Name:   user.Name,
		})
	}
}

func handleLogin(userRepo *db.UserRepository, authSvc *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Get user
		user, err := userRepo.GetUserByEmail(req.Email)
		if err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		// Verify password
		if !authSvc.VerifyPassword(user.Password, req.Password) {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		// Generate token
		token, err := authSvc.GenerateToken(user.ID, user.Email, 24*time.Hour)
		if err != nil {
			http.Error(w, "Token generation failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(AuthResponse{
			Token:  token,
			UserID: user.ID,
			Email:  user.Email,
			Name:   user.Name,
		})
	}
}

func handleRefresh(authSvc *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := authSvc.ValidateToken(token)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Generate new token
		newToken, err := authSvc.GenerateToken(claims.UserID, claims.Email, 24*time.Hour)
		if err != nil {
			http.Error(w, "Token generation failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"token": newToken})
	}
}

func handleGetOrgs(orgRepo *db.OrgRepository, authSvc *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("user_id").(string)

		orgs, err := orgRepo.ListOrgsByOwner(userID)
		if err != nil {
			http.Error(w, "Failed to fetch organizations", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"orgs": orgs})
	}
}

type CreateOrgRequest struct {
	Name string `json:"name"`
	Plan string `json:"plan"`
}

func handleCreateOrg(orgRepo *db.OrgRepository, authSvc *services.AuthService, orgSvc *services.OrganizationService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("user_id").(string)

		var req CreateOrgRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Validate plan
		if !orgSvc.ValidatePlan(req.Plan) {
			http.Error(w, "Invalid plan", http.StatusBadRequest)
			return
		}

		org, err := orgRepo.CreateOrg(userID, req.Name, req.Plan)
		if err != nil {
			http.Error(w, "Failed to create organization", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(org)
	}
}

func handleGetOrg(orgRepo *db.OrgRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := chi.URLParam(r, "orgId")

		org, err := orgRepo.GetOrg(orgID)
		if err != nil {
			http.Error(w, "Organization not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(org)
	}
}

type UpdateOrgRequest struct {
	Name string `json:"name"`
	Plan string `json:"plan"`
}

func handleUpdateOrg(orgRepo *db.OrgRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := chi.URLParam(r, "orgId")

		var req UpdateOrgRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if err := orgRepo.UpdateOrg(orgID, req.Name, req.Plan); err != nil {
			http.Error(w, "Failed to update organization", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"updated"}`)
	}
}

type CreateTeamRequest struct {
	Name string `json:"name"`
}

func handleCreateTeam(teamRepo *db.TeamRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := chi.URLParam(r, "orgId")

		var req CreateTeamRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		team, err := teamRepo.CreateTeam(orgID, req.Name)
		if err != nil {
			http.Error(w, "Failed to create team", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(team)
	}
}

func handleGetTeams(teamRepo *db.TeamRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := chi.URLParam(r, "orgId")

		teams, err := teamRepo.ListTeamsByOrg(orgID)
		if err != nil {
			http.Error(w, "Failed to fetch teams", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"teams": teams})
	}
}

func handleUpdateTeam(teamRepo *db.TeamRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		teamID := chi.URLParam(r, "teamId")
		if teamID == "" {
			http.Error(w, "Missing team ID", http.StatusBadRequest)
			return
		}

		var req UpdateTeamRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if req.Name == "" {
			http.Error(w, "Name is required", http.StatusBadRequest)
			return
		}

		if err := teamRepo.UpdateTeam(teamID, req.Name); err != nil {
			http.Error(w, "Failed to update team", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"updated","team_id":"%s"}`, teamID)
	}
}

type UpdateTeamRequest struct {
	Name string `json:"name"`
}

type UpdateConfigRequest struct {
	Provider string `json:"provider"`
	APIKey   string `json:"api_key"`
	Settings string `json:"settings"`
}

type CreateConfigRequest struct {
	Provider string `json:"provider"`
	APIKey   string `json:"api_key"`
	Settings string `json:"settings"`
}

func handleCreateConfig(configRepo *db.ConfigRepository, encSvc *services.EncryptionService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Context().Value("org_id").(string)

		var req CreateConfigRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Encrypt API key
		encryptedKey := encSvc.EncryptAPIKey(req.APIKey)

		config, err := configRepo.CreateConfig(orgID, req.Provider, encryptedKey, req.Settings)
		if err != nil {
			http.Error(w, "Failed to create configuration", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(config)
	}
}

func handleListConfigs(configRepo *db.ConfigRepository, authSvc *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-Org-ID")
		if orgID == "" {
			http.Error(w, "Missing org ID", http.StatusBadRequest)
			return
		}

		configs, err := configRepo.ListConfigsByOrg(orgID)
		if err != nil {
			http.Error(w, "Failed to fetch configurations", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"configs": configs})
	}
}

func handleGetConfig(configRepo *db.ConfigRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		configID := chi.URLParam(r, "configId")

		config, err := configRepo.GetConfig(configID)
		if err != nil {
			http.Error(w, "Configuration not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(config)
	}
}

func handleUpdateConfig(configRepo *db.ConfigRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		configID := chi.URLParam(r, "configId")
		if configID == "" {
			http.Error(w, "Missing config ID", http.StatusBadRequest)
			return
		}

		var req UpdateConfigRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if req.Provider == "" || req.APIKey == "" {
			http.Error(w, "Provider and API key are required", http.StatusBadRequest)
			return
		}

		if err := configRepo.UpdateConfig(configID, req.Provider, req.APIKey, req.Settings); err != nil {
			http.Error(w, "Failed to update configuration", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"updated","config_id":"%s"}`, configID)
	}
}

func handleDeleteConfig(configRepo *db.ConfigRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		configID := chi.URLParam(r, "configId")

		if err := configRepo.DeleteConfig(configID); err != nil {
			http.Error(w, "Failed to delete configuration", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

type CalculateRequest struct {
	Items []services.CostCalculation `json:"items"`
}

func handleCalculateCost(costRepo *db.CostRepository, costSvc *services.CostCalculationService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-Org-ID")

		var req CalculateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Calculate
		result := costSvc.CalculateCost(req.Items)

		// Store in database
		usageJSON, _ := json.Marshal(req.Items)
		breakdownJSON, _ := json.Marshal(result.Breakdown)

		calcVar := req.Items[0].Provider // Use first provider as default
		if len(req.Items) > 0 {
			calcVar = req.Items[0].Provider
		}

		_, err := costRepo.CreateCalculation(orgID, calcVar, string(usageJSON), string(breakdownJSON), result.TotalCost)
		if err != nil {
			log.Printf("Failed to store calculation: %v", err)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(result)
	}
}

func handleListCalculations(costRepo *db.CostRepository, authSvc *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-Org-ID")
		if orgID == "" {
			http.Error(w, "Missing org ID", http.StatusBadRequest)
			return
		}

		calcs, err := costRepo.ListCalculations(orgID, 100)
		if err != nil {
			http.Error(w, "Failed to fetch calculations", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"calculations": calcs})
	}
}

func handleAnalyticsSummary(costRepo *db.CostRepository, authSvc *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-Org-ID")
		if orgID == "" {
			http.Error(w, "Missing org ID", http.StatusBadRequest)
			return
		}

		total, err := costRepo.GetOrgCostSummary(orgID)
		if err != nil {
			http.Error(w, "Failed to fetch analytics", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"total_cost_30_days": total,
			"period":             "30_days",
		})
	}
}

func handleSyncProviders(configRepo *db.ConfigRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-Org-ID")
		if orgID == "" {
			http.Error(w, "Missing org ID", http.StatusBadRequest)
			return
		}

		configs, err := configRepo.ListConfigsByOrg(orgID)
		if err != nil {
			http.Error(w, "Failed to fetch configurations", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"synced":       time.Now().Format(time.RFC3339),
			"config_count": len(configs),
		})
	}
}

func handleGetProviderStatus(configRepo *db.ConfigRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-Org-ID")
		if orgID == "" {
			http.Error(w, "Missing org ID", http.StatusBadRequest)
			return
		}

		configs, err := configRepo.ListConfigsByOrg(orgID)
		if err != nil {
			http.Error(w, "Failed to fetch provider status", http.StatusInternalServerError)
			return
		}

		providerStatus := make(map[string]string)
		for _, config := range configs {
			if config.Active {
				providerStatus[config.Provider] = "connected"
			} else {
				providerStatus[config.Provider] = "disconnected"
			}
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"providers": providerStatus})
	}
}

// Middleware
func authMiddleware(authSvc *services.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Missing authorization header", http.StatusUnauthorized)
				return
			}

			token := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := authSvc.ValidateToken(token)
			if err != nil {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			// Add user info to context
			ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
			ctx = context.WithValue(ctx, "email", claims.Email)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// Helper
func getEnv(key, defaultVal string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultVal
}
