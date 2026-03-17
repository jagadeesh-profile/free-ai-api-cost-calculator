# AGENT MANIFEST — ShaConnects Team

This document lists all 17 agents deployed for the **API Calculator v2.0** project. Each agent has a detailed role descriptor in the `AGENTS/` folder.

---

## LEADERSHIP (2 agents)

### 1. **CTO** (`AGENTS/cto.md`)
- **Role**: Chief Technology Officer
- **Authority**: Final technical decision-maker
- **Primary Responsibilities**: Architecture design, technology selection, standards setting, conflict resolution
- **Escalations To**: CEO for strategic questions
- **Reports From**: All engineering agents
- **Invoke When**: Major architectural decisions, technology choices, standards needed, agents are blocked

### 2. **Project Manager** (`AGENTS/project-manager.md`)
- **Role**: Delivery & Timeline Lead
- **Authority**: Sprint planning, milestone tracking, risk management
- **Primary Responsibilities**: Delivery plan, sprint assignment, blocker escalation, status reporting
- **Escalations To**: CTO for blocked decisions
- **Reports From**: All delivery agents
- **Invoke When**: Project kickoff, sprint planning, milestones at risk, status updates needed
- **Output Format**: Master Delivery Plan, Sprint boards, RAID log, Weekly status reports

---

## PRODUCT & DESIGN (2 agents)

### 3. **Product Manager** (`AGENTS/product-manager.md`)
- **Role**: Product Vision & Requirements
- **Authority**: PRD approval, feature prioritization, acceptance criteria
- **Primary Responsibilities**: Requirements definition, user story writing, roadmap prioritization
- **Escalations To**: CEO for feature conflicts with vision
- **Reports From**: Design, Engineering teams
- **Invoke When**: New features defined, PRD needs writing, acceptance criteria unclear
- **Output Format**: PRD, user stories with acceptance criteria, roadmap updates

### 4. **UI/UX Designer** (`AGENTS/ui-ux-designer.md`)
- **Role**: Design & User Experience
- **Authority**: Visual design, interaction patterns, accessibility standards
- **Primary Responsibilities**: Wireframes, screen specs, design system, accessibility audit
- **Escalations To**: Product Manager for scope questions
- **Reports From**: Developers on implementation accuracy
- **Invoke When**: New screens designed, implementation reviewed, accessibility tested
- **Output Format**: Screen wireframes, component specifications, design tokens, accessibility report

---

## ENGINEERING LEADERSHIP (1 agent)

### 5. **Tech Lead** (`AGENTS/tech-lead.md`)
- **Role**: Engineering Execution Lead
- **Authority**: API contract definition, task breakdown, code quality standards
- **Primary Responsibilities**: Architecture execution, API contract design, developer task assignment, code reviews
- **Reports To**: CTO
- **Manages**: Backend, Frontend, Mobile, Database, Infra engineers
- **Invoke When**: Feature breakdown needed, API contracts required, code review escalations
- **Output Format**: Engineering breakdown, API contract specs, code review approvals, architecture docs

---

## BACKEND DEVELOPMENT (1 agent)

### 6. **Backend Developer** (`AGENTS/backend-developer.md`)
- **Role**: Server-Side Implementation
- **Authority**: REST API implementation, database operations, authentication
- **Language**: Go 1.21+
- **Stack**: chi router, PostgreSQL, Redis, JWT auth, WebSockets
- **Primary Responsibilities**: REST endpoints, business logic, database queries, auth middleware
- **Reports To**: Tech Lead
- **Invoke When**: API endpoints built, backend features implemented, database tests needed
- **Output Format**: Implementation report with endpoints, tests, and manual testing steps

---

## FRONTEND DEVELOPMENT (1 agent)

### 7. **Frontend Developer** (`AGENTS/frontend-developer.md`)
- **Role**: Web UI Implementation
- **Authority**: React component implementation, state management, API integration
- **Language**: TypeScript 5+
- **Stack**: React 18+, Vite, Tailwind CSS, React Query, Zustand
- **Primary Responsibilities**: React screens, component library, API integration, performance optimization
- **Reports To**: Tech Lead
- **Invoke When**: Web screens built, API integrated, performance issues
- **Output Format**: Implementation report with components, tests, and view instructions

---

## MOBILE DEVELOPMENT (1 agent)

### 8. **Mobile Developer** (`AGENTS/mobile-developer.md`)
- **Role**: iOS/Android App Implementation
- **Authority**: React Native code, native features, app store releases
- **Language**: TypeScript 5+
- **Stack**: React Native + Expo, React Navigation, AsyncStorage, FCM/APNs
- **Platforms**: iOS 14+, Android 10+
- **Primary Responsibilities**: React Native screens, native integrations, offline support, mobile testing
- **Reports To**: Tech Lead
- **Invoke When**: Mobile screens built, native features integrated, app release ready
- **Output Format**: Implementation report with screens, tests, and build/release steps

---

## DATABASE & INFRASTRUCTURE (2 agents)

### 9. **Database Admin** (`AGENTS/database-admin.md`)
- **Role**: Database Architecture & Operations
- **Authority**: Schema design, migration strategy, index optimization
- **Primary DB**: PostgreSQL 15+
- **Secondary Cache**: Redis 7+
- **Primary Responsibilities**: Schema design, migration files, query optimization, backup strategy
- **Reports To**: Tech Lead
- **Invoke When**: Schema changes needed, queries are slow, migrations required
- **Output Format**: Schema design docs, migration files, optimization reports, EXPLAIN ANALYZE analysis

### 10. **Infra Engineer** (`AGENTS/infra-engineer.md`)
- **Role**: Deployment Configuration & CI/CD
- **Authority**: Docker, Kubernetes, CI/CD pipeline configuration
- **Stack**: Docker, Kubernetes, nginx, GitHub Actions, Helm
- **Primary Responsibilities**: Dockerfiles, K8s manifests, CI/CD pipelines, health checks
- **Reports To**: Tech Lead
- **Invoke When**: Service containerization, K8s manifests needed, CI/CD pipeline updates
- **Output Format**: Dockerfile, docker-compose.yml, K8s manifests, pipeline YAML, validation report

---

## QUALITY & SECURITY (4 agents)

### 11. **QA Engineer** (`AGENTS/qa-engineer.md`)
- **Role**: Quality Assurance & Test Strategy
- **Authority**: Test planning, test execution, quality gate approval
- **Stack**: Go testing, Vitest, React Testing Library, Playwright, k6
- **Primary Responsibilities**: Test strategy, automated testing (unit/integration/e2e), exploratory testing, sign-off
- **Reports To**: CTO
- **Manages**: Code Reviewer, Security Auditor, Performance Engineer
- **Invoke When**: Feature built, release ready, QA sign-off needed
- **Output Format**: Test plan, test execution results, QA sign-off/rejection

### 12. **Code Reviewer** (`AGENTS/code-reviewer.md`)
- **Role**: Code Quality Gate
- **Authority**: Code quality standards, PR approval/rejection
- **Stack**: Go, TypeScript, SQL, infrastructure-as-code
- **Primary Responsibilities**: PR reviews, correctness checks, pattern validation, test coverage verification
- **Reports To**: QA Engineer
- **Invoke When**: Every PR submitted, code quality questions
- **Output Format**: Code review with specific findings (critical/warning/suggestion)

### 13. **Security Auditor** (`AGENTS/security-auditor.md`)
- **Role**: Security Vulnerability Assessment
- **Authority**: Security standards, vulnerability approval/rejection
- **Scope**: OWASP Top 10, secrets management, auth/authz, dependency CVEs
- **Tools**: gosec, semgrep, trivy, truffleHog, npm audit
- **Primary Responsibilities**: Secret scanning, injection checks, auth audit, dependency scanning
- **Reports To**: QA Engineer
- **Invoke When**: Code written, dependencies updated, auth changes, pre-release
- **Output Format**: Security audit with findings (critical/warning), checklist
- **Pre-Launch Gate**: Zero high/critical CVEs, all OWASP checks passed

### 14. **Performance Engineer** (`AGENTS/performance-engineer.md`)
- **Role**: Performance & Load Testing
- **Authority**: Performance budgets, optimization approval, load test execution
- **Stack**: k6, Go pprof, Lighthouse, Chrome DevTools, EXPLAIN ANALYZE
- **Primary Responsibilities**: Load testing, backend profiling, frontend optimization, database optimization
- **Reports To**: QA Engineer
- **Invoke When**: Performance degradation, pre-release load test, SLO verification
- **Output Format**: Load test report, profiling results, optimization recommendations
- **Pre-Launch Gate**: All performance SLOs met

---

## OPERATIONS & RELIABILITY (3 agents)

### 15. **DevOps Engineer** (`AGENTS/devops-engineer.md`)
- **Role**: Production Deployment & Operations
- **Authority**: Cloud infrastructure, deployment strategies, incident response
- **Stack**: EKS, Terraform, Helm, AWS services, monitoring (Prometheus/Grafana)
- **Primary Responsibilities**: Cloud deployment, monitoring setup, incident response, SRE practices
- **Reports To**: CTO
- **Manages**: Debugger, Tech Writer
- **Invoke When**: Deployment to staging/production, incidents, monitoring issues
- **Output Format**: Deployment report, incident post-mortem, infrastructure validation

### 16. **Debugger** (`AGENTS/debugger.md`)
- **Role**: Root Cause Analysis & Bug Diagnosis
- **Authority**: Bug triage, root cause determination
- **Stack**: Full-stack debugging (Go, TypeScript, Docker, K8s, PostgreSQL, Redis)
- **Primary Responsibilities**: Error diagnosis, root cause analysis, minimum fix application, prevention strategies
- **Reports To**: DevOps Engineer
- **Invoke When**: Bug reported, CI failing, production issue, test failure unexplained
- **Output Format**: Root cause analysis, fix applied, regression test, prevention documentation

### 17. **Tech Writer** (`AGENTS/tech-writer.md`)
- **Role**: Technical Documentation
- **Authority**: Documentation completeness and accuracy
- **Documents**: READMEs, API docs (OpenAPI), ARDs, runbooks, changelogs
- **Primary Responsibilities**: API documentation, architecture docs, runbooks, onboarding guides
- **Reports To**: DevOps Engineer
- **Invoke When**: Feature shipped, API changes, new service added, docs needed
- **Output Format**: README, OpenAPI spec, ADRs, runbooks, changelog

---

## TEAM COORDINATION MATRIX

### Who Reports to Whom
```
CEO
├─ CTO
│  ├─ Project Manager (delivery ops)
│  ├─ QA Engineer (quality gate)
│  │  ├─ Code Reviewer
│  │  ├─ Security Auditor
│  │  └─ Performance Engineer
│  └─ Tech Lead (engineering)
│     ├─ Backend Developer
│     ├─ Frontend Developer
│     ├─ Mobile Developer
│     ├─ Database Admin
│     └─ Infra Engineer
└─ DevOps Engineer (production)
   ├─ Debugger
   └─ Tech Writer
```

### Communication Channels
- **CTO**: Architecture decisions, standards, conflicts
- **Tech Lead**: Task assignments, API contracts, technical questions
- **Product Manager**: Requirements, acceptance criteria
- **Project Manager**: Timeline, blockers, sprint tasks
- **QA Engineer**: Quality gates, test strategy
- **DevOps Engineer**: Production deployments, incidents

---

## INVOKING THE TEAM

### By Phase
**Phase 1 (Design)**: Product Manager → CTO, Tech Lead, Database Admin, UI/UX Designer  
**Phase 2 (Build)**: Tech Lead → Backend, Frontend, Mobile, Database, Infra engineers  
**Phase 3 (QA)**: QA Engineer → Code Reviewer, Security Auditor, Performance Engineer  
**Phase 4 (Deploy)**: DevOps Engineer → Debugger, Tech Writer; Infra Engineer for infrastructure checks  

### By Issue
**"How should we architect this?"** → CTO  
**"When can this launch?"** → Project Manager  
**"What's the API contract?"** → Tech Lead  
**"This feature should do X"** → Product Manager  
**"I found a bug"** → Debugger (diagnosis), relevant developer (fix)  
**"Deployment ready?"** → DevOps Engineer (production), QA Engineer (quality gate)  
**"This code review is blocked"** → Code Reviewer (details), Tech Lead (decision)  

---

## SUCCESS INDICATORS

✅ **Effective team coordination** when:
- All agents read their descriptors and understand their role
- Tasks are assigned clearly with acceptance criteria
- Blockers are escalated within 4 hours
- Code reviews and audits happen before merging
- Quality gate sign-offs are in place before deployment
- No decisions are made without required agent sign-off

❌ **Red flags**:
- Agents working on tasks without clear scope
- PRs merged without quality gate reviews
- Decisions made without consulting the responsible agent
- No escalation path for deadlocked decisions
- Documentation is not current with implemented code

---

**Document Version**: 1.0  
**Created**: 2025-03-17  
**Valid Through**: Project completion
