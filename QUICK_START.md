# 🚀 MONDAY MORNING QUICK START GUIDE

**Your first 30 minutes on Monday:**

---

## 1️⃣ CLONE & SETUP (5 min)

```bash
# Backend setup
cd backend
go mod download
go mod tidy

# Frontend setup
cd ../frontend
npm install
npm run build
```

---

## 2️⃣ START SERVICES (5 min)

```bash
# Terminal 1: Infrastructure
cd api-calculator
docker-compose -f docker-compose.prod.yml up -d

# Verify PostgreSQL is running
docker exec api_calculator_postgres_1 pg_isready

# Terminal 2: Backend
cd backend
go run main.go
# Expected: "Server running on port 8080"

# Terminal 3: Frontend
cd frontend
npm run dev
# Expected: "Local: http://localhost:5173"
```

---

## 3️⃣ VERIFY IT WORKS (5 min)

```bash
# Test backend health
curl http://localhost:8080/health

# Test API endpoint (create account)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'

# Expected response:
{
  "success": true,
  "data": {"user_id": "uuid-here"},
  "message": "User registered successfully"
}
```

---

## 4️⃣ PICK YOUR ROLE

### 👨‍💻 BACKEND Developer
**Start with**: `backend/main.go` line 1
**First task**: Complete auth handler tests
**Your file structure**:
```
backend/
├─ main.go              ← All handler code
├─ models/models.go     ← Data types
├─ db/repositories.go   ← Database queries
├─ services/services.go ← Business logic
└─ migrations/          ← Database schemas
```

### 🎨 FRONTEND Developer
**Start with**: `frontend/src/pages/Login.tsx`
**First task**: Connect Login form to API
**Your file structure**:
```
frontend/src/
├─ pages/              ← UI pages
├─ api/endpoints.ts    ← API calls
├─ api/hooks.ts        ← React Query hooks
├─ components/         ← Reusable components
└─ store/auth.ts       ← Auth state
```

### 🐳 DevOps/Infra
**Start with**: `docker-compose.prod.yml`
**First task**: Verify services running
**Your files**:
```
├─ docker-compose.prod.yml  ← Local dev setup
├─ k8s/production.yaml      ← Kubernetes deployment
├─ nginx.conf               ← Reverse proxy
└─ .github/workflows/       ← CI/CD pipeline
```

---

## 5️⃣ YOUR FIRST COMMIT

### Backend
```bash
cd backend
go test ./... -v
git add -A
git commit -m "feat: add auth handler tests (20 tests passing)"
```

### Frontend
```bash
cd frontend
npm test
git add -A
git commit -m "feat: connect login form to real API"
```

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| `Connection refused` | Check Docker: `docker-compose ps` |
| `npm ERR! 404` | Run `npm install` in frontend folder |
| `go: command not found` | Install Go 1.21+ |
| `Port 8080 already in use` | Kill process: `lsof -i :8080` |
| `Database migration error` | Reset: `docker-compose down -v && docker-compose up -d` |
| `CORS error in browser` | Check backend is running on localhost:8080 |
| `Login not working` | Check token in browser DevTools → Application → localStorage |

---

## 📍 CURRENT STATE

✅ All scaffolding complete
✅ Database schema created
✅ Backend handlers stubbed with working DB
✅ Frontend UI components ready
✅ API layer fully typed

🚀 **YOU'RE 40% DONE - Time to implement the tests and connections!**

---

## 📊 DAILY METRICS (Track These)

| Metric | Mon | Tue | Wed | Thu | Fri |
|--------|-----|-----|-----|-----|-----|
| Tests written | 20 | 20 | 20 | 20 | +20 |
| API endpoints tested | 5 | 5 | 5 | 5 | +5 |
| Components styled | 2 | 2 | 2 | 2 | +2 |
| Bug fixes | 5 | 5 | 5 | 5 | +5 |

---

## 🎯 SUCCESS CRITERIA

By end of day Monday:
- ✅ Auth system working end-to-end
- ✅ At least 20 passing tests (backend)
- ✅ Login page connected to API (frontend)
- ✅ All 3 services running locally
- ✅ Zero critical bugs

---

## 💬 ASK FOR HELP

- **Architecture questions**: Ask Tech Lead
- **API design questions**: Ask Backend Lead
- **UI/UX questions**: Ask Frontend Lead
- **Infrastructure issues**: Ask DevOps
- **Timeline concerns**: Ask Project Manager

---

**You've got this! Start with your role above, and commit early and often. 🚀**
