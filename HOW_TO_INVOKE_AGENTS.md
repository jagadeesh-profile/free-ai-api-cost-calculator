# HOW TO INVOKE THE AGENT TEAM FOR API CALCULATOR v2.0

This guide explains how to use the 17-agent ShaConnects team to build the upgraded API Calculator.

---

## QUICK START

### 1. Understand Your Team
- **17 specialized agents** in the `AGENTS/` folder, each with a detailed role descriptor
- **Clear reporting structure** (see AGENT_MANIFEST.md for org chart)
- **Three master coordination documents**: PROJECT_BRIEF.md, AGENT_MANIFEST.md, MASTER_DELIVERY_PLAN.md

### 2. Start Phase 1: Design & Planning
**Send To**: CTO, Product Manager, Tech Lead, Database Admin, UI/UX Designer

```
Project: API Calculator v2.0 — Next Generation
Vision: Enterprise-grade cost calculator with real-time API integration, team collaboration, mobile app
Timeline: 10 weeks to production
Success: 50K+ MAU, <100ms p95 latency, 99.95% uptime

Please begin Phase 1 (Design & Planning):
1. Product Manager: Write PRD with user stories
2. CTO: Design architecture, produce ADR
3. UI/UX Designer: Create wireframes and design system
4. Tech Lead: Break down engineering tasks
5. Database Admin: Design PostgreSQL schema

Reference: PROJECT_BRIEF.md, MASTER_DELIVERY_PLAN.md
```

### 3. Each Agent Reads Their Descriptor
Each agent in `AGENTS/[role].md` contains:
- Identity and scope
- Technology stack
- Core responsibilities
- Standards and conventions
- Workflow
- Output format

**Example**: Backend Developer should read `AGENTS/backend-developer.md`

### 4. Track Progress in MASTER_DELIVERY_PLAN.md
The sprint table shows:
- Assigned tasks
- Acceptance criteria
- Story points
- Who is responsible
- Current status

---

## INVOKING AGENTS BY SCENARIO

### Scenario: "I need to define the project requirements"
**Primary Agent**: Product Manager  
**Supporting Agents**: CTO (feasibility), CEO (vision)

```
@Product Manager:
Please create the PRD for API Calculator v2.0.

Input:
- Vision: [from CEO brief in PROJECT_BRIEF.md section 1]
- Target users: Enterprise teams using multiple AI APIs
- Key features: Real-time cost tracking, team collaboration, mobile app, analytics

Output Needed:
- PRD with problem statement, goals, user stories, acceptance criteria
- MoSCoW prioritization (Must/Should/Could/Won't have)
- Success metrics defined

Timeline: 3 days (by Day 3 of Phase 1)
Acceptance: CTO feasibility sign-off
```

---

### Scenario: "I need architecture and tech decisions"
**Primary Agent**: CTO  
**Supporting Agents**: Tech Lead (execution), Database Admin (schema), Infra Engineer (deployment)

```
@CTO:
Please design the architecture for API Calculator v2.0.

Input:
- PRD (from Product Manager — provides requirements)
- Target scale: 50K MAU, <100ms p95 latency, 99.95% uptime
- Constraints: 10-week timeline, 17-person team

Output Needed:
- Architecture Decision Record (ADR)
  - Context: What problem are we solving?
  - Decision: What architecture are we choosing? (e.g., microservices, monolith, etc.)
  - Consequences: Trade-offs, scaling limits, operational complexity
- Technology choices: Database (PostgreSQL?), backend language (Go?), mobile (React Native?)
- High-level service diagram
- Data model overview

Timeline: 2 days after PRD approval
Acceptance: Self-approved (CTO authority), shared with team
```

---

### Scenario: "I need estimates and sprint planning"
**Primary Agent**: Project Manager  
**Supporting Agents**: Tech Lead (task breakdown), CTO (priority)

```
@Project Manager:
Please create the Master Delivery Plan for API Calculator v2.0.

Input:
- PRD (from Product Manager)
- ADR and architecture (from CTO)
- Engineering breakdown (from Tech Lead)
- Design system (from UI/UX Designer)

Output Needed:
- Master Delivery Plan (MASTER_DELIVERY_PLAN.md)
  - 10-week timeline broken into 4 phases
  - Sprint 1-5 task assignments with story points
  - Acceptance criteria for each task
  - Dependencies and sequencing
  - RAID log (risks, assumptions, issues, dependencies)
  - Milestones with clear go/no-go gates

Timeline: By end of Phase 1 (Day 7)
Acceptance: CTO + Tech Lead sign-off before proceeding to Phase 2
```

---

### Scenario: "I need to implement a REST API endpoint"
**Primary Agent**: Backend Developer  
**Supporting Agents**: Tech Lead (contract approval), Code Reviewer (quality gate), Database Admin (schema)

```
@Backend Developer:
Please implement the POST /auth/register API endpoint.

Input:
- API contract (from Tech Lead) specifying:
  - Request body schema (email, password, name)
  - Response schema (user object with ID, token)
  - Error codes (400 invalid input, 409 user exists, 500 server error)
  - Authentication requirement (none for register)

Implementation Checklist:
1. Write handler in backend/internal/api/auth.go
2. Write request validation
3. Call service layer (backend/internal/service/auth.go)
4. Return consistent JSON response
5. Write unit tests (backend/internal/api/auth_test.go)
6. Run linter: golangci-lint run ./...
7. Submit PR to Tech Lead for review

Timeline: [story points] hours
Acceptance Criteria:
- [ ] Endpoint callable via curl
- [ ] All edge cases handled (invalid email, password too short, etc.)
- [ ] Database call wrapped in transaction
- [ ] JWT token issued with 24h expiry
- [ ] Tests passing, code review approved
```

---

### Scenario: "I need to build a React component"
**Primary Agent**: Frontend Developer  
**Supporting Agents**: UI/UX Designer (specs), Tech Lead (API contract), Code Reviewer (quality)

```
@Frontend Developer:
Please implement the LoginScreen component.

Input:
- UI/UX spec (from Designer): [wireframe description, layout, states]
- API contract: POST /auth/register, POST /auth/login
- Required states: empty, loading, error, success

Implementation Checklist:
1. Create frontend/src/pages/LoginScreen.tsx
2. Build form with email + password inputs
3. Implement form validation
4. Call backend API via frontend/src/api/auth.ts
5. Handle loading, error, success states
6. Make responsive (mobile/tablet/desktop)
7. Write React Testing Library tests
8. Pass accessibility checks (color contrast, ARIA labels)
9. Test manually at http://localhost:5173

Timeline: [story points] hours
Acceptance:
- [ ] Screen renders and matches UI spec exactly
- [ ] Form validation works
- [ ] Successful login → redirects to dashboard
- [ ] Error messages are user-friendly
- [ ] Mobile responsive (tested on <768px viewport)
- [ ] All tests passing
- [ ] Code review approved
```

---

### Scenario: "Code quality review needed before merge"
**Primary Agent**: Code Reviewer  
**Triggered By**: Tech Lead or Developer

```
@Code Reviewer:
Please review this PR for quality.

Input:
- PR: backend/api: implement POST /auth/register
- Files changed:
  - backend/internal/api/auth.go (+50 lines)
  - backend/internal/api/auth_test.go (+40 lines)

Review Against:
- [ ] Does the code do what the task requires?
- [ ] Are all acceptance criteria from the task met?
- [ ] Are all edge cases handled?
- [ ] Is error handling complete? (every error wrapped with context)
- [ ] Are there parameterized SQL queries? (never string concatenation)
- [ ] Is the code testable? (unit tests present, >80% coverage)
- [ ] Are function names descriptive?
- [ ] Are there magic numbers? (should be named constants)
- [ ] Does it follow ShaConnects conventions? (see backend-developer.md)
- [ ] Does golangci-lint pass?

Output:
- Code review report with:
  - Status: ✅ Approved | ⚠️ Approved with minor changes | 🔴 Changes required
  - Critical issues (must fix)
  - Warnings (should fix)
  - Suggestions (nice to have)
  - Approver signature

Timeline: 24 hours
Acceptance: Approved or specific required changes listed
```

---

### Scenario: "I need security audit before production"
**Primary Agent**: Security Auditor  
**Triggered By**: QA Engineer (before launch gate)

```
@Security Auditor:
Please audit API Calculator v2.0 for security vulnerabilities.

Scope:
- Source code (Go backend, TypeScript frontend, database migrations)
- Dependencies (go.mod, package.json, package-lock.json)
- Infrastructure (Dockerfile, K8s YAML, CI/CD pipeline)
- Secrets (any env vars, .env files in git history)

Audit Checks:
- [ ] **Secrets scanning**: Zero hardcoded credentials (API keys, passwords, tokens)
- [ ] **SQL injection**: All DB queries parameterized (no string concatenation)
- [ ] **Authentication**: JWT validation, refresh token rotation, logout
- [ ] **Authorization**: Role-based checks on protected endpoints
- [ ] **CORS**: Explicit allowed origins (not wildcard)
- [ ] **CSP headers**: Content-Security-Policy present and restrictive
- [ ] **Dependency CVEs**: go.mod audit, npm audit (flag HIGH/CRITICAL)
- [ ] **Docker image**: Non-root user, secrets not baked in, scanned with trivy
- [ ] **Secrets manager**: All production secrets in AWS Secrets Manager

Output:
- Security audit report with:
  - Findings flagged by severity (Critical/High/Medium/Low)
  - Exact location (file:line)
  - Risk explanation
  - Remediation steps
- Checklist: all items ✅ before launch gate

Timeline: 1-2 days
Gate: Zero HIGH/CRITICAL issues before launch
```

---

### Scenario: "I need performance testing & optimization"
**Primary Agent**: Performance Engineer  
**Triggered By**: QA Engineer (Phase 3)

```
@Performance Engineer:
Please performance test and optimize API Calculator v2.0.

Scope:
- Load test backend API (100 concurrent users)
- Frontend Lighthouse audit (all key pages)
- Database query optimization

Performance Budgets (must meet):
- API p50 latency: <50ms
- API p95 latency: <200ms
- API p99 latency: <500ms
- Error rate: <0.1% 5xx
- Frontend LCP: <2.5s
- Frontend CLS: <0.1
- JS bundle per route: <250KB compressed

Tasks:
1. Write k6 load test script (ramp-up, sustained, spike)
2. Run load test against staging database
3. Capture CPU/memory profiles (pprof)
4. Run Lighthouse on dashboard, login, config screens
5. Identify bottlenecks (slow queries, expensive computations)
6. If over budget: optimize and re-test

Output:
- Load test report with p50/p95/p99 latency + error rate
- Lighthouse scores + recommendations
- Bottleneck analysis + optimization recommendations
- Before/after comparison if optimizations applied

Timeline: 3-4 days
Gate: All budgets met before launch
```

---

### Scenario: "I found a bug, how do I debug?"
**Primary Agent**: Debugger  
**Triggered By**: Developer, QA Engineer, or production alert

```
@Debugger:
I found a bug: Users can see other users' configurations.

Bug Report:
- Title: Authorization bypass in GET /configs
- Steps to reproduce:
  1. User A logs in, copies their token
  2. User B logs in
  3. User A calls: GET /configs with User B's config ID
  4. Response: User A can see User B's config (WRONG!)
- Expected: 403 Forbidden error
- Actual: 200 OK with full config data
- Environment: Staging

Debugging Process:
1. Reproduce the bug locally
2. Read the code: backend/internal/api/configs.go
3. Trace execution: request → handler → service → database query
4. Identify root cause: Service layer doesn't check org_id before returning config
5. Find all similar patterns: grep for similar auth checks
6. Write the fix: Add org_id check in service.GetConfig()
7. Write a test that would catch this: TestConfigForbiddenOtherOrg
8. Verify fix: bug no longer reproducible
9. Document: "Authorization bypass — insufficient resource-level checks"

Output:
- Root cause: [exact explanation]
- Fix applied: [code change]
- Test added: [test case name]
- Regression risk: Low (only affects this endpoint)
- Prevention: Add auth check pattern to code review standards

Timeline: 2-4 hours
Acceptance: Bug no longer reproducible, test added
```

---

### Scenario: "What's the current project status?"
**Primary Agent**: Project Manager  
**Frequency**: Weekly (Friday) to CEO + CTO

```
Status Report — Week [N]
Project: API Calculator v2.0
Overall Status: 🟢 On Track | 🟡 At Risk | 🔴 Off Track

Completed This Week:
- Sprint 1: Backend auth API endpoints (8/8 stories done)
- Sprint 1: Database schema applied and migrated
- Sprint 1: GitHub Actions CI pipeline running

In Progress:
- Sprint 2: Frontend login/register screens (Week 4, 50% complete)
- Sprint 2: REST API integration in frontend
- Infra: Docker build optimization

Blocked:
- None currently

At Risk:
- Mobile QA testing: may need to start earlier (detected risk)
  - Mitigation: Pre-allocate mobile dev earlier in Sprint 3
  - Escalation to CTO: Not needed yet

Next Week:
- Complete Sprint 2: All frontend screens
- Start Sprint 3: Mobile React Native screens
- Load test baseline: Run initial k6 tests
- Begin Code Review sweep: Prepare for Phase 3

Decisions Needed:
- [ ] Should we include push notifications in MVP? (proposed by PM)
  - Waiting on: CTO approval or deferral to v2.1
```

---

## AGENT COMMUNICATION TEMPLATES

### How to Ask an Agent for Work

**Good**:
```
@Backend Developer:
Please implement the POST /costs/calculate endpoint.

Contract (from Tech Lead):
- Request: { providers: string[], inputTokens: number, outputTokens: number }
- Response: { costPerProvider: { [provider]: CostDetail } }
- Auth: Required (Bearer token)
- Errors: 400 invalid input, 401 unauthorized

Acceptance Criteria:
- [ ] Endpoint reachable at POST /costs/calculate
- [ ] Validates input (all fields present, positive numbers)
- [ ] Returns cost breakdown for each provider
- [ ] Handles missing providers gracefully
- [ ] Tests: at least 4 test cases (happy path, edge cases)

Due: Wednesday 5 PM
```

**Bad**:
```
@Backend Developer: Can you build the cost calculation?
```

---

### How to Report Blocking Issues

**Good**:
```
@Tech Lead (escalating to CTO):
I'm blocked on frontend API integration.

Issue:
Backend API returns Cost objects with provider-specific fields that vary by provider.
Example:
- OpenAI: { id, model, inputTokens, outputTokens, cost }
- Anthropic: { id, model_name, prompt_tokens, completion_tokens, cost }

Problem: Frontend doesn't know which fields to expect → can't type the response.

Needed From CTO:
1. Should we normalize provider responses in backend?
2. Or should frontend handle per-provider response shapes?

Impact: Frontend development blocked for Sprint 2 integration work

Escalation: This affects Sprint 2 timeline (in progress)
Requested ETA for decision: By Wednesday 2 PM
```

**Bad**:
```
@Tech Lead: The API responses don't match
```

---

### How to Report Completion

**Good**:
```
@Tech Lead: Backend Sprint 1 complete

Endpoints implemented:
- ✅ POST /auth/register
- ✅ POST /auth/login
- ✅ POST /auth/refresh
- ✅ GET /orgs/{id}
- ✅ POST /orgs
- ✅ POST /teams
- ✅ GET /configurations
- ✅ POST /sync/openai

All acceptance criteria met:
- Unit tests passing (87% coverage)
- Integration tests passing
- golangci-lint passing
- All PRs reviewed and approved by Code Reviewer

Blockers: None
Ready for: Frontend integration (Sprint 2)

Code location: github.com/api-calculator/backend/main#sprint-1-complete
```

---

## DAILY COORDINATION RHYTHM

### 09:00 AM — Daily Standup (10 min, all agents)
Each agent reports 30 seconds max:
- Yesterday: What I finished
- Today: What I'm working on
- Blocking: Anything stuck?

**Example**:
```
Backend Dev: "Finished 2 auth endpoints yesterday. Starting org endpoints today. Not blocked."
Frontend Dev: "Stuck waiting on API contract update — asking Tech Lead now"
QA Eng: "Starting test plan write. No blockers."
```

### 02:00 PM — Tech Sync (30 min, Tech Lead + development agents)
- Design reviews (new patterns, dependencies)
- Code review blockers
- Architecture questions

### 04:00 PM — Async Status Updates (Slack/email)
Developers post: "I just merged PR #123 — feature X is done"

### Friday 02:00 PM — Weekly Status Report
Project Manager sends to CEO + CTO:
- What we completed
- On-track items
- Risk flags + mitigation
- Next week plan

---

## WHEN THINGS GO WRONG

### "We're over budget on story points"
1. **Immediate**: Escalate to Project Manager
2. **PM Action**: Review with Tech Lead — which stories are over?
3. **CTO+PM**: Decide: reduce scope, extend timeline, or accept over-spend?
4. **Communication**: Update CEO and team

### "Code review is blocking progress"
1. **Developer**: Create issue "Code review feedback needs response"
2. **Tech Lead**: Mediate between developer + reviewer
3. **CTO** (if unresolved): Make final call on code quality vs timeline trade-off

### "QA found 20 bugs"
1. **QA**: Rank by severity (P0: blocks launch, P1: must fix, P2: can defer v2.1)
2. **Tech Lead**: Assign P0/P1 fixes to developers
3. **Project Manager**: Assess impact on timeline — request CTO decision if launch threatened

### "Backend API changed and broke frontend"
1. **Frontend Dev**: File a bug "API contract violation in endpoint X"
2. **Tech Lead**: Review API contract — did backend deviate?
3. **Backend Dev**: Revert change OR update API contract + frontend
4. **Code Reviewer**: Approve updated PR

---

## HOW TO MEASURE SUCCESS

You'll know the agents are working well when:
✅ Tasks have clear owners and acceptance criteria  
✅ Blockers are escalated within 4 hours (not sitting for days)  
✅ Daily standups are efficient (<10 min, focused)  
✅ Code reviews happen within 24 hours  
✅ PRs are merged without quality gate failures  
✅ Schedule is being tracked accurately (velocity per sprint)  
✅ Quality gate passes on time  
✅ Launch happens with confidence  

Red flags:
❌ Vague task descriptions ("build the dashboard")  
❌ Blockers sitting unresolved  
❌ Code reviews take 3+ days  
❌ Schedule slipping weekly  
❌ Code quality declining  
❌ Agents working in silos (no communication)  

---

## NEXT STEPS

1. **Read PROJECT_BRIEF.md** — understand the vision and scope
2. **Read AGENT_MANIFEST.md** — see the team structure and roles
3. **Read MASTER_DELIVERY_PLAN.md** — understand the timeline and phasing
4. **Invoke the CTO** → Start Phase 1 design work
5. **Join daily standups** → Coordinate with the team

---

**Ready to build? Let's ship v2.0! 🚀**
