#!/bin/bash
# Fast-Track Sprint Bootstrap Script
# Run this to set up your local development environment

set -e

echo "================================"
echo "Shaconnects Cost Calculator v2.0"
echo "Fast-Track Sprint Setup"
echo "================================"

# Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command -v go &> /dev/null; then
    echo "❌ Go not installed. Please install Go 1.21+"
    exit 1
fi
echo "✅ Go $(go version | awk '{print $3}')"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Please install Node.js 20+"
    exit 1
fi
echo "✅ Node.js $(node --version)"

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Please install Docker"
    exit 1
fi
echo "✅ Docker $(docker --version | awk '{print $3}')"

# Start database services
echo ""
echo "Starting database services (PostgreSQL, Redis)..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for services
echo "Waiting for services to be ready..."
sleep 10

# Create database
echo ""
echo "Initializing database..."
psql -U calculator -h localhost -d postgres -c "CREATE DATABASE api_calculator;" 2>/dev/null || true
psql -U calculator -h localhost -d api_calculator -f backend/migrations/001_initial_schema.sql

echo "✅ Database initialized"

# Backend setup
echo ""
echo "Setting up backend..."
cd backend
go mod download
echo "✅ Backend dependencies installed"
cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..

# Create .env files if missing
if [ ! -f "backend/.env.development" ]; then
    cat > backend/.env.development << EOF
PORT=8080
DATABASE_URL=postgres://calculator:calculator123@localhost:5432/api_calculator?sslmode=disable
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-only-for-development
LOG_LEVEL=debug
EOF
    echo "✅ Created backend/.env.development"
fi

if [ ! -f "frontend/.env.development" ]; then
    cat > frontend/.env.development << EOF
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Shaconnects Cost Calculator
VITE_ENVIRONMENT=development
EOF
    echo "✅ Created frontend/.env.development"
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start backend:"
echo "   cd backend && go run main.go"
echo ""
echo "2. Start frontend (in new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open browser:"
echo "   http://localhost:5173"
echo ""
echo "4. Demo login (any email/password):"
echo "   Email: dev@shaconnects.com"
echo "   Password: anything"
echo ""
