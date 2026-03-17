package db

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/lib/pq"
)

type User struct {
	ID        string
	Email     string
	Name      string
	Password  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// CreateUser inserts a new user into the database
func (r *UserRepository) CreateUser(email, name, passwordHash string) (*User, error) {
	var id string
	var createdAt time.Time

	err := r.db.QueryRow(`
		INSERT INTO users (email, name, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at
	`, email, name, passwordHash).Scan(&id, &createdAt)

	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return nil, errors.New("email already exists")
		}
		return nil, err
	}

	return &User{
		ID:        id,
		Email:     email,
		Name:      name,
		CreatedAt: createdAt,
		UpdatedAt: createdAt,
	}, nil
}

// GetUserByEmail retrieves a user by email
func (r *UserRepository) GetUserByEmail(email string) (*User, error) {
	user := &User{}
	err := r.db.QueryRow(`
		SELECT id, email, name, password_hash, created_at, updated_at
		FROM users WHERE email = $1
	`, email).Scan(&user.ID, &user.Email, &user.Name, &user.Password, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (r *UserRepository) GetUserByID(id string) (*User, error) {
	user := &User{}
	err := r.db.QueryRow(`
		SELECT id, email, name, created_at, updated_at
		FROM users WHERE id = $1
	`, id).Scan(&user.ID, &user.Email, &user.Name, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return user, nil
}

// Organization repository
type Organization struct {
	ID        string
	OwnerID   string
	Name      string
	Plan      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type OrgRepository struct {
	db *sql.DB
}

func NewOrgRepository(db *sql.DB) *OrgRepository {
	return &OrgRepository{db: db}
}

// CreateOrg creates a new organization
func (r *OrgRepository) CreateOrg(ownerID, name, plan string) (*Organization, error) {
	var id string
	var createdAt time.Time

	err := r.db.QueryRow(`
		INSERT INTO organizations (owner_id, name, plan, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at
	`, ownerID, name, plan).Scan(&id, &createdAt)

	if err != nil {
		return nil, err
	}

	return &Organization{
		ID:        id,
		OwnerID:   ownerID,
		Name:      name,
		Plan:      plan,
		CreatedAt: createdAt,
		UpdatedAt: createdAt,
	}, nil
}

// GetOrg retrieves an organization
func (r *OrgRepository) GetOrg(id string) (*Organization, error) {
	org := &Organization{}
	err := r.db.QueryRow(`
		SELECT id, owner_id, name, plan, created_at, updated_at
		FROM organizations WHERE id = $1
	`, id).Scan(&org.ID, &org.OwnerID, &org.Name, &org.Plan, &org.CreatedAt, &org.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("organization not found")
		}
		return nil, err
	}

	return org, nil
}

// ListOrgsByOwner lists all organizations owned by a user
func (r *OrgRepository) ListOrgsByOwner(ownerID string) ([]Organization, error) {
	rows, err := r.db.Query(`
		SELECT id, owner_id, name, plan, created_at, updated_at
		FROM organizations WHERE owner_id = $1
		ORDER BY created_at DESC
	`, ownerID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orgs []Organization
	for rows.Next() {
		var org Organization
		err := rows.Scan(&org.ID, &org.OwnerID, &org.Name, &org.Plan, &org.CreatedAt, &org.UpdatedAt)
		if err != nil {
			return nil, err
		}
		orgs = append(orgs, org)
	}

	return orgs, rows.Err()
}

// UpdateOrg updates an organization
func (r *OrgRepository) UpdateOrg(id, name, plan string) error {
	_, err := r.db.Exec(`
		UPDATE organizations
		SET name = $1, plan = $2, updated_at = NOW()
		WHERE id = $3
	`, name, plan, id)

	return err
}

// Team repository
type Team struct {
	ID        string
	OrgID     string
	Name      string
	CreatedAt time.Time
}

type TeamRepository struct {
	db *sql.DB
}

func NewTeamRepository(db *sql.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

// CreateTeam creates a new team
func (r *TeamRepository) CreateTeam(orgID, name string) (*Team, error) {
	var id string
	var createdAt time.Time

	err := r.db.QueryRow(`
		INSERT INTO teams (org_id, name, created_at)
		VALUES ($1, $2, NOW())
		RETURNING id, created_at
	`, orgID, name).Scan(&id, &createdAt)

	if err != nil {
		return nil, err
	}

	return &Team{
		ID:        id,
		OrgID:     orgID,
		Name:      name,
		CreatedAt: createdAt,
	}, nil
}

// ListTeamsByOrg lists all teams in an organization
func (r *TeamRepository) ListTeamsByOrg(orgID string) ([]Team, error) {
	rows, err := r.db.Query(`
		SELECT id, org_id, name, created_at
		FROM teams WHERE org_id = $1
		ORDER BY created_at DESC
	`, orgID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var teams []Team
	for rows.Next() {
		var team Team
		err := rows.Scan(&team.ID, &team.OrgID, &team.Name, &team.CreatedAt)
		if err != nil {
			return nil, err
		}
		teams = append(teams, team)
	}

	return teams, rows.Err()
}

// UpdateTeam updates a team's name
func (r *TeamRepository) UpdateTeam(id, name string) error {
	_, err := r.db.Exec(`
		UPDATE teams
		SET name = $1, created_at = NOW()
		WHERE id = $2
	`, name, id)
	return err
}

// AddTeamMember adds a user to a team
func (r *TeamRepository) AddTeamMember(teamID, userID, role string) error {
	_, err := r.db.Exec(`
		INSERT INTO team_members (team_id, user_id, role, created_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (team_id, user_id) DO UPDATE SET role = $3
	`, teamID, userID, role)

	return err
}

// Configuration (API keys) repository
type Configuration struct {
	ID        string
	OrgID     string
	Provider  string
	APIKey    string
	Settings  string
	Active    bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ConfigRepository struct {
	db *sql.DB
}

func NewConfigRepository(db *sql.DB) *ConfigRepository {
	return &ConfigRepository{db: db}
}

// CreateConfig creates a new API key configuration
func (r *ConfigRepository) CreateConfig(orgID, provider, apiKey, settings string) (*Configuration, error) {
	var id string
	var createdAt time.Time

	err := r.db.QueryRow(`
		INSERT INTO configurations (org_id, provider, api_key, settings, active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, true, NOW(), NOW())
		RETURNING id, created_at
	`, orgID, provider, apiKey, settings).Scan(&id, &createdAt)

	if err != nil {
		return nil, err
	}

	return &Configuration{
		ID:        id,
		OrgID:     orgID,
		Provider:  provider,
		APIKey:    apiKey,
		Settings:  settings,
		Active:    true,
		CreatedAt: createdAt,
		UpdatedAt: createdAt,
	}, nil
}

// GetConfig retrieves a configuration
func (r *ConfigRepository) GetConfig(id string) (*Configuration, error) {
	config := &Configuration{}
	err := r.db.QueryRow(`
		SELECT id, org_id, provider, api_key, settings, active, created_at, updated_at
		FROM configurations WHERE id = $1
	`, id).Scan(&config.ID, &config.OrgID, &config.Provider, &config.APIKey, &config.Settings, &config.Active, &config.CreatedAt, &config.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("configuration not found")
		}
		return nil, err
	}

	return config, nil
}

// ListConfigsByOrg lists all configurations for an org
func (r *ConfigRepository) ListConfigsByOrg(orgID string) ([]Configuration, error) {
	rows, err := r.db.Query(`
		SELECT id, org_id, provider, api_key, settings, active, created_at, updated_at
		FROM configurations WHERE org_id = $1 AND active = true
		ORDER BY created_at DESC
	`, orgID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var configs []Configuration
	for rows.Next() {
		var config Configuration
		err := rows.Scan(&config.ID, &config.OrgID, &config.Provider, &config.APIKey, &config.Settings, &config.Active, &config.CreatedAt, &config.UpdatedAt)
		if err != nil {
			return nil, err
		}
		configs = append(configs, config)
	}

	return configs, rows.Err()
}

// UpdateConfig updates a configuration
func (r *ConfigRepository) UpdateConfig(id, provider, apiKey, settings string) error {
	_, err := r.db.Exec(`
		UPDATE configurations
		SET provider = $1, api_key = $2, settings = $3, updated_at = NOW()
		WHERE id = $4
	`, provider, apiKey, settings, id)
	return err
}

// DeleteConfig soft-deletes a configuration
func (r *ConfigRepository) DeleteConfig(id string) error {
	_, err := r.db.Exec(`
		UPDATE configurations SET active = false, updated_at = NOW() WHERE id = $1
	`, id)
	return err
}

// Cost Calculation repository
type CostCalculation struct {
	ID         string
	OrgID      string
	Provider   string
	UsageData  string
	TotalCost  float64
	Breakdown  string
	CreatedAt  time.Time
}

type CostRepository struct {
	db *sql.DB
}

func NewCostRepository(db *sql.DB) *CostRepository {
	return &CostRepository{db: db}
}

// CreateCalculation saves a cost calculation
func (r *CostRepository) CreateCalculation(orgID, provider, usageData, breakdown string, totalCost float64) (*CostCalculation, error) {
	var id string
	var createdAt time.Time

	err := r.db.QueryRow(`
		INSERT INTO cost_calculations (org_id, provider, usage_data, total_cost, breakdown, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at
	`, orgID, provider, usageData, totalCost, breakdown).Scan(&id, &createdAt)

	if err != nil {
		return nil, err
	}

	return &CostCalculation{
		ID:        id,
		OrgID:     orgID,
		Provider:  provider,
		UsageData: usageData,
		TotalCost: totalCost,
		Breakdown: breakdown,
		CreatedAt: createdAt,
	}, nil
}

// ListCalculations lists cost calculations for an org
func (r *CostRepository) ListCalculations(orgID string, limit int) ([]CostCalculation, error) {
	rows, err := r.db.Query(`
		SELECT id, org_id, provider, usage_data, total_cost, breakdown, created_at
		FROM cost_calculations WHERE org_id = $1
		ORDER BY created_at DESC LIMIT $2
	`, orgID, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var calcs []CostCalculation
	for rows.Next() {
		var calc CostCalculation
		err := rows.Scan(&calc.ID, &calc.OrgID, &calc.Provider, &calc.UsageData, &calc.TotalCost, &calc.Breakdown, &calc.CreatedAt)
		if err != nil {
			return nil, err
		}
		calcs = append(calcs, calc)
	}

	return calcs, rows.Err()
}

// GetOrgCostSummary gets total cost for an org
func (r *CostRepository) GetOrgCostSummary(orgID string) (float64, error) {
	var total float64
	err := r.db.QueryRow(`
		SELECT COALESCE(SUM(total_cost), 0) FROM cost_calculations
		WHERE org_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
	`, orgID).Scan(&total)

	return total, err
}
