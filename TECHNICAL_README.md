# Shaconnects Cost Calculator v2.0 - FAST-TRACK SPRINT

**Project Status**: 🚀 **ACTIVE SPRINT** - Full scaffolding generated, ready for implementation

**Sprint Duration**: 2-3 weeks to production  
**Target Launch**: Week of March 24-30, 2026  
**Team**: 15 specialized agents across backend, frontend, infrastructure, QA, security

---

## 📋 Project Overview

Complete enterprise cost calculation platform with:
- **Real-time cost tracking** for multiple AI providers (OpenAI, Anthropic, Cohere)
- **Team collaboration** with organizations and teams
- **Provider management** with API key rotation and sync
- **Analytics dashboard** with cost trends and provider status
- **Mobile-ready** responsive interface
- **Enterprise security** with JWT auth, encrypted secrets, network policies
- **Scalable infrastructure** with Kubernetes auto-scaling

---

## 🏗️ Architecture

### Technology Stack

**Backend**: Go 1.21 with chi router  
**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS  
**Database**: PostgreSQL 15 + Redis 7  
**Infrastructure**: Docker, Kubernetes, nginx  
**CI/CD**: GitHub Actions + ArgoCD  
**Cloud**: AWS (EKS, RDS, ElastiCache, ECR)

### Directory Structure

```
api-calculator/
├── backend/                     # Go backend service
│   ├── main.go                 # Entry point with chi routes
│   ├── models/                 # Data models
│   ├── handlers/               # HTTP handlers (to be created)
│   ├── services/               # Business logic (to be created)
│   ├── db/                     # Database interactions (to be created)
│   ├── migrations/             # SQL migrations
│   ├── Dockerfile              # Multi-stage build
│   └── go.mod/go.sum          # Dependencies
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── App.tsx            # Main app component
│   │   ├── pages/             # Route pages
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Calculator.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/        # Reusable components
│   │   │   └── Layout.tsx
│   │   ├── store/             # Zustand state
│   │   │   └── auth.ts
│   │   └── api/               # API client
│   │       └── client.ts
│   ├── package.json           # Dependencies
│   ├── vite.config.ts         # Build config
│   ├── tailwind.config.js     # Styling
│   ├── Dockerfile             # Multi-stage build
│   └── src/index.html         # Entry point
│
├── k8s/                        # Kubernetes manifests
│   └── production.yaml        # Full K8s deployment
│
├── .github/workflows/         # CI/CD pipelines
│   └── ci-cd.yml             # Build, test, deploy
│
├── docker-compose.prod.yml    # Local development
├── nginx.conf                 # API routing
└── README.md                  # This file
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Go 1.21+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### 1. Start Services with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8080)
- Frontend (port 5173)
- Nginx reverse proxy (port 80)

### 2. Backend Development

```bash
cd backend

# Install dependencies
go mod download

# Run development server
go run main.go
# API available at http://localhost:8080
```

**Environment variables** (.env.development):
```
PORT=8080
DATABASE_URL=postgres://calculator:calculator123@localhost:5432/api_calculator?sslmode=disable
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-in-production
```

### 3. Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
# UI available at http://localhost:5173
```

### 4. Initialize Database

```bash
# Create database
psql -U postgres -h localhost -c "CREATE DATABASE api_calculator;"

# Run migrations
psql -U calculator -h localhost -d api_calculator -f backend/migrations/001_initial_schema.sql
```

---

## 📊 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Auth
- `POST /auth/register` - Create user account
- `POST /auth/login` - Get JWT token
- `POST /auth/refresh` - Refresh token

#### Organizations
- `GET /orgs` - List user's organizations
- `POST /orgs` - Create organization
- `GET /orgs/{orgId}` - Get org details
- `PUT /orgs/{orgId}` - Update org

#### Teams
- `POST /orgs/{orgId}/teams` - Create team
- `GET /orgs/{orgId}/teams` - List teams

#### Cost Calculation
- `POST /calculate` - Calculate costs from usage data
- `GET /configurations` - List API key configurations
- `POST /configurations` - Add provider API key
- `DELETE /configurations/{configId}` - Remove configuration

#### Provider Management
- `POST /sync/providers` - Sync provider data
- `GET /providers/status` - Check provider connectivity

---

## 🛠️ Development Workflow

### 1. Branch Strategy
```bash
# Create feature branch from develop
git checkout -b feature/your-feature develop

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature
```

### 2. Code Quality

**Backend**:
```bash
cd backend
go fmt ./...          # Format code
go vet ./...          # Lint
go test ./...         # Run tests
```

**Frontend**:
```bash
cd frontend
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run test          # Jest/Vitest
```

### 3. Commit Messages
Follow conventional commits:
```
feat: add login page
fix: resolve auth token bug
refactor: simplify cost calculation
docs: update API documentation
test: add calculator tests
chore: update dependencies
```

---

## 📦 Building for Production

### Docker Images

**Backend**:
```bash
cd backend
docker build -t api-calculator-backend:latest .
docker push ghcr.io/shaconnects/api-calculator/backend:latest
```

**Frontend**:
```bash
cd frontend
docker build -t api-calculator-frontend:latest .
docker push ghcr.io/shaconnects/api-calculator/frontend:latest
```

### Kubernetes Deployment

```bash
# Deploy to cluster
kubectl apply -f k8s/production.yaml

# Check status
kubectl get pods -n api-calculator
kubectl logs -f deployment/backend -n api-calculator

# Scale if needed
kubectl scale deployment backend --replicas=5 -n api-calculator
```

---

## 🔐 Security Checklist

- [ ] Change all default passwords before production
- [ ] Generate strong JWT_SECRET (256-bit minimum)
- [ ] Enable HTTPS/TLS in Ingress
- [ ] Configure resource limits on all pods
- [ ] Enable NetworkPolicy isolation
- [ ] Rotate API keys regularly
- [ ] Enable audit logging
- [ ] Set up RBAC policies
- [ ] Scan images for vulnerabilities
- [ ] Configure pod security policies

---

## 📈 Monitoring & Observability

### Health Checks
- Backend: `GET http://localhost:8080/health`
- Frontend: `GET http://localhost:5173/`

### Metrics (to be implemented)
- Prometheus metrics on `/metrics`
- Grafana dashboards
- CloudWatch for AWS metrics

### Logging
- Structured JSON logging
- Log level configurable via LOG_LEVEL
- Centralized logging (ELK stack recommended)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test -v -race -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

---

## 📝 Agent Tasks & Ownership

### Phase 1 (Week 1-2): Foundation
- **Product Manager**: Finalize PRD, user stories
- **CTO**: Architecture ADRs, technical decisions
- **Backend Lead**: API contract, handler stubs
- **Frontend Lead**: UI component library, routing setup
- **Database Admin**: Schema optimization, indexing
- **DevOps**: CI/CD pipeline, Docker setup

### Phase 2 (Week 3-4): Core Features
- **Backend Team**: Handler implementation, services, auth
- **Frontend Team**: Page implementation, API integration
- **QA Engineer**: Test plans, automation setup
- **Mobile Dev**: React Native app scaffold

### Phase 3 (Week 5-6): Integration & Polish
- **Security Auditor**: Security review, penetration testing
- **Performance Engineer**: Load testing, optimization
- **Tech Lead**: Code review, refactoring
- **Dev Ops Engineer**: Infrastructure hardening

### Phase 4 (Week 7-8): Testing & Launch
- **QA Team**: Full test execution, bug tracking
- **Debugger**: Production staging, issue triage
- **Tech Writer**: Documentation, runbooks
- **DevOps**: Production deployment, monitoring

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL
docker-compose logs postgres

# Verify connection
psql -U calculator -h localhost -d api_calculator -c "SELECT 1;"
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Backend Build Errors
```bash
cd backend
go clean -cache
go mod tidy
go build
```

---

## 📞 Support & Communication

### Daily Standups
**Time**: 9:00 AM UTC  
**Duration**: 15 minutes  
**Format**: Zoom / Teams call  
**Topics**: Blockers, progress, dependencies

### Technical Syncs
**Monday/Wednesday/Friday**: 1:00 PM UTC  
**Setup**: Architecture reviews, design decisions

### Weekly Status
**Friday 3:00 PM UTC**: Stakeholder update

---

## 📚 Additional Resources

- [Go Chi Documentation](https://github.com/go-chi/chi)
- [React 18 Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Kubernetes Docs](https://kubernetes.io/docs)
- [PostgreSQL 15](https://www.postgresql.org/docs/15)

---

## 📄 License

Proprietary - Shaconnects Internal

---

**Last Updated**: March 17, 2026  
**Sprint Lead**: Tech Lead + Project Manager  
**Status**: 🟢 ON TRACK
