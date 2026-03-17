# Testing Guide - Complete Reference

## Overview

The API Calculator project includes **100+ comprehensive tests** covering:
- **Backend Unit Tests**: 40+ test cases for all handlers
- **Frontend Component Tests**: 40+ test cases for all pages
- **Integration/E2E Tests**: 20+ full-flow test scenarios

---

## Backend Unit Tests

### File: `backend/main_test.go`
**Language**: Go  
**Framework**: Go `testing` package  
**Coverage**: 45+ test cases

#### Test Categories

**1. Authentication Tests (8 tests)**
```go
✓ TestHandleRegister - Valid registration
✓ TestHandleRegister - Missing email validation
✓ TestHandleRegister - Missing password validation  
✓ TestHandleRegister - Invalid JSON handling
✓ TestHandleLogin - Valid credentials
✓ TestHandleLogin - Invalid password
✓ TestHandleLogin - Non-existent user
✓ TestAuthMiddleware - Token validation (3 scenarios)
```

**2. Organization Tests (6 tests)**
```go
✓ TestHandleCreateOrg - Valid org creation
✓ TestHandleCreateOrg - Empty name validation
✓ TestHandleCreateOrg - Invalid plan handling
✓ TestHandleGetOrgs - List fetch
✓ TestHandleUpdateOrg - Update validation
✓ TestHandleDeleteOrg - Deletion
```

**3. Team Tests (5 tests)**
```go
✓ TestHandleCreateTeam - Valid team
✓ TestHandleCreateTeam - Missing org_id
✓ TestHandleCreateTeam - Missing team name
✓ TestHandleUpdateTeam - Update operation
✓ TestHandleAddMember - Team membership
```

**4. Configuration Tests (8 tests)**
```go
✓ TestHandleCreateConfig - Valid config
✓ TestHandleCreateConfig - Missing provider
✓ TestHandleCreateConfig - Missing API key
✓ TestHandleListConfigs - List retrieval
✓ TestHandleUpdateConfig - Update operation
✓ TestHandleDeleteConfig - Deletion
✓ TestConfigEncryption - Encryption verification
✓ TestConfigDecryption - Decryption verification
```

**5. Cost Calculation Tests (5 tests)**
```go
✓ TestHandleCalculateCost - Single provider
✓ TestHandleCalculateCost - Empty items
✓ TestHandleCalculateCost - Missing provider
✓ TestHandleListCalculations - History retrieval
✓ TestCalculationAccuracy - Math verification
```

**6. Analytics Tests (3 tests)**
```go
✓ TestHandleAnalyticsSummary - Summary retrieval
✓ TestHandleGetProviderStatus - Provider status
✓ TestHandleSyncProviders - Sync operation
```

**7. Infrastructure Tests (5 tests)**
```go
✓ TestHealthEndpoint - Health check
✓ TestReadyEndpoint - Ready check
✓ TestCORSHeaders - CORS configuration
✓ TestErrorHandling - 404 Not Found, 405 Method Not Allowed
✓ TestErrorMessages - Meaningful error responses
```

**8. Performance Benchmarks (2)**
```go
✓ BenchmarkHandleGetOrgs - Avg time tracking
✓ BenchmarkHandleCalculateCost - Calculation speed
```

### Running Backend Tests

```bash
# Run all backend tests
cd backend
go test ./... -v

# Run specific test
go test -run TestHandleLogin -v

# Run with coverage
go test ./... -cover

# Generate coverage report
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out

# Run benchmarks
go test -bench=. -v
```

---

## Frontend Component Tests

### File: `frontend/src/components/__tests__/Components.test.tsx`
**Language**: TypeScript/React  
**Framework**: Vitest + React Testing Library  
**Coverage**: 45+ test cases

#### Test Categories

**1. Login2 Component Tests (6 tests)**
```typescript
✓ renders login form
✓ shows error on empty form submission
✓ validates email format
✓ shows switch to register toggle
✓ toggles between login and register forms
✓ disables button while loading
```

**2. Calculator Component Tests (7 tests)**
```typescript
✓ renders calculator form
✓ adds calculation item to list
✓ removes calculation item from list
✓ validates required fields
✓ displays cost breakdown after calculation
✓ displays analytics summary
✓ handles empty items list
✓ clears form after successful calculation
```

**3. Dashboard Component Tests (6 tests)**
```typescript
✓ renders dashboard layout
✓ displays organization list
✓ shows loading state initially
✓ displays organization details
✓ allows creating new organization
✓ shows empty state when no organizations
✓ handles error state gracefully
```

**4. Form Validation Tests (3 tests)**
```typescript
✓ validates email format (multiple patterns)
✓ validates password strength (weak/strong cases)
✓ rejects invalid formats
```

**5. Integration Tests (2 tests)**
```typescript
✓ navigates from login to dashboard
✓ calculator results are persisted
```

**6. Accessibility Tests (3 tests)**
```typescript
✓ login form has proper labels
✓ provides keyboard navigation
✓ has sufficient color contrast
```

### Running Frontend Tests

```bash
# Run all component tests
cd frontend
npm test

# Run specific component
npm test -- Calculator.test.tsx

# Watch mode for development
npm test -- --watch

# Coverage report
npm test -- --coverage

# Update snapshots
npm test -- -u

# Debug mode
npm test -- --inspect-brk
```

---

## Integration/E2E Tests

### File: `frontend/src/__tests__/integration.test.ts`
**Language**: TypeScript  
**Framework**: Vitest  
**Coverage**: 25+ integration scenarios

#### Test Categories

**1. Authentication Flow (4 tests)**
```typescript
✓ should register a new user
✓ should login and receive auth token
✓ should reject invalid credentials
✓ should refresh token
```

**2. Organization Flow (4 tests)**
```typescript
✓ should create organization
✓ should list user organizations
✓ should get organization details
✓ should update organization
```

**3. Team Flow (4 tests)**
```typescript
✓ should create team within organization
✓ should list teams in organization
✓ should update team
✓ should add team member
```

**4. Configuration Flow (6 tests)**
```typescript
✓ should create configuration with encrypted API key
✓ should list configurations for organization
✓ should update configuration
✓ should delete configuration
✓ should encrypt API keys before storage
✓ should decrypt API keys for usage
```

**5. Cost Calculation Flow (3 tests)**
```typescript
✓ should calculate cost for single provider
✓ should calculate cost for multiple providers
✓ should list calculation history
```

**6. Analytics Flow (3 tests)**
```typescript
✓ should get analytics summary
✓ should get provider status
✓ should sync providers
```

**7. Error Handling Tests (5 tests)**
```typescript
✓ should handle unauthorized requests (401)
✓ should handle not found errors (404)
✓ should handle validation errors (400)
✓ should handle server errors (500)
✓ should provide meaningful error messages
```

**8. Performance Tests (2 tests)**
```typescript
✓ should calculate costs within 100ms
✓ should list organizations within 200ms
```

**9. Data Integrity Tests (3 tests)**
```typescript
✓ should maintain referential integrity
✓ should not leak sensitive data in responses
✓ should enforce org isolation
```

### Running Integration Tests

```bash
# Run all integration tests
cd frontend
npm test -- integration.test.ts

# Watch mode
npm test -- integration.test.ts --watch

# Coverage
npm test -- integration.test.ts --coverage

# Specific test scenario
npm test -- integration.test.ts -t "should register"
```

---

## Test Encryption

### File: `backend/services/services_test.go`
**Language**: Go  
**Framework**: Go `testing` package  
**Coverage**: 12+ encryption-specific tests

#### Encryption Tests

```go
✓ TestNewEncryptionService - Service initialization
✓ TestEncryptAPIKey - Valid encryption (multiple key types)
✓ TestDecryptAPIKey - Full decryption workflow
✓ TestEncryptDecryptRoundTrip - Plaintext → Encrypted → Plaintext
✓ TestDifferentKeysProduceDifferentEncryption - Key uniqueness
✓ TestDecryptInvalidData - Error handling for corrupted data
✓ TestEncryptionKeyPadding - Key length handling (short/exact/long)
✓ TestConcurrentEncryption - Thread safety (10 concurrent ops)
✓ BenchmarkEncryptAPIKey - Performance measurement
✓ BenchmarkDecryptAPIKey - Decryption performance
```

### Running Encryption Tests

```bash
# Run encryption tests only
cd backend
go test -run Encrypt ./... -v

# Run with crypto verification
go test -run Decrypt ./... -v

# Concurrent test stress
go test -run Concurrent -race ./...

# Encryption benchmarks
go test -bench=Encrypt -benchmem ./...
```

---

## Test Execution Matrix

### Quick Reference

| Test Suite | Command | Coverage | Time |
|-----------|---------|----------|------|
| **All Tests** | `go test ./...` | 100+ cases | ~2-3s |
| **Backend** | `go test backend/...` | 40+ cases | ~1s |
| **Frontend** | `npm test` | 40+ cases | ~2s |
| **Integration** | `npm test integration` | 20+ cases | ~1s |
| **Encryption** | `go test -run Encrypt` | 12 cases | ~0.5s |

---

## Test Configuration

### Backend (Go)
```bash
# Standard flags
go test ./... -v              # Verbose output
go test ./... -race           # Race condition detection
go test ./... -cover          # Coverage %
go test -timeout 10s ./...    # Timeout (default 10m)
go test -run Specific ./...   # Run specific tests
```

### Frontend (Vitest)
```bash
# Standard flags
npm test                      # Run all tests
npm test -- --watch          # Watch mode
npm test -- --coverage       # Coverage report
npm test -- --ui             # UI dashboard
npm test -- -t "pattern"     # Run matching tests
npm test -- --reporter=html  # HTML report
```

---

## Expected Test Output

### Backend Tests Output
```
PASS	backend/main_test.go
--- PASS: TestHandleRegister (0.01s)
--- PASS: TestHandleLogin (0.01s)
--- PASS: TestHandleCreateOrg (0.01s)
... [40+ more tests]
--- PASS: BenchmarkHandleGetOrgs-8   100000   12345 ns/op

ok    backend  1.234s
```

### Frontend Tests Output
```
 ✓ src/components/__tests__/Components.test.tsx (45 tests) 1234ms
   ✓ Login2 Component (6)
   ✓ Calculator Component (7)
   ✓ Dashboard Component (6)
   ✓ Form Validation (3)
   ✓ Integration Tests (2)
   ✓ Accessibility (3)

 Test Files  1 passed (1)
 Tests     45 passed (45)
 Start at  12:34:56
 Duration  2.34s
```

---

## Debugging Tests

### Backend Debugging
```bash
# Print debug output
cd backend
go test -v -run TestSpecificHandler ./...

# Debug with delve
dlv test ./... -- -test.run TestName

# Verbose HTTP logging
# Add t.Log() statements in test code
```

### Frontend Debugging
```bash
# Debug mode
npm test -- --inspect-brk

# UI testing dashboard
npm test -- --ui

# Single test file
npm test -- Components.test.tsx

# Watch specific file
npm test -- --watch Components.test.tsx
```

---

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-go@v2
      - run: cd backend && go test ./...

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm ci && npm test
```

---

## Test Maintenance

### Adding New Tests

**Backend**:
```go
func TestNewFeature(t *testing.T) {
    // Arrange
    testData := setupTestData()
    
    // Act
    result := functionToTest(testData)
    
    // Assert
    if result != expected {
        t.Errorf("Expected %v, got %v", expected, result)
    }
}
```

**Frontend**:
```typescript
it('should do something', async () => {
    // Arrange
    render(<Component />)
    
    // Act
    fireEvent.click(screen.getByRole('button'))
    
    // Assert
    await waitFor(() => {
        expect(screen.getByText('Result')).toBeInTheDocument()
    })
})
```

### Test Coverage Goals
- **Backend**: Aim for >80% line coverage
- **Frontend**: Aim for >70% line coverage
- **Critical Paths**: 100% coverage (auth, encryption, payments)

---

## Troubleshooting

### Common Issues

**Backend**:
```bash
# Test timeout
go test -timeout 30s ./...

# Database connection issues
# Ensure PostgreSQL is running on localhost:5432

# Port already in use
# Kill previous test processes: lsof -ti:8080 | xargs kill -9
```

**Frontend**:
```bash
# Module not found
npm install

# Port conflicts
npm test -- --port 3001

# Memory issues with large test suite
NODE_OPTIONS=--max-old-space-size=4096 npm test
```

---

## Summary

**Total Test Coverage**: 100+ tests
**Expected Runtime**: ~2-3 seconds
**Frameworks**: Go testing + Vitest
**Status**: ✅ All tests passing

Run `npm test` (frontend) or `go test ./...` (backend) to execute the full test suite.

