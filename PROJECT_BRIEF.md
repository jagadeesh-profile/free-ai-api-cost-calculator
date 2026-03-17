# PROJECT BRIEF: API Calculator v2.0 — Next Generation

**Project ID**: APICal-2025-v2  
**Status**: INITIATION  
**Target Launch**: Q2 2025  
**Owner**: CEO  
**Approved by**: CTO  

---

## 1. VISION & GOALS

### Problem Statement
The current **Free AI API Cost Calculator** (v1.0) is a successful web application helping users calculate and compare costs across 10+ AI providers. However, it lacks:
- **Enterprise features**: team collaboration, saved configurations, billing integration
- **Real-time monitoring**: live API cost tracking integrated with provider dashboards
- **Advanced analytics**: cost trends, optimization recommendations, anomaly detection
- **Mobile support**: seamless mobile experience for on-the-go cost tracking
- **Extensibility**: plugin architecture for custom providers and metrics
- **Scalability**: current stack has throughput limitations under load

### Goals (v2.0)
1. **Enterprise Readiness**: add org/team management, role-based access, audit logs
2. **Real-time Integration**: live sync with OpenAI, Anthropic, Google cost APIs
3. **Advanced Features**: predictive analytics, cost anomaly alerts, optimization engine
4. **Mobile-first**: React Native app for iOS and Android with offline support
5. **Performance**: scale to 100K+ monthly active users with <100ms p95 latency
6. **Extensibility**: plugin system for community-contributed providers and integrations

### Success Metrics
| Metric | Baseline (v1.0) | Target (v2.0) | Measurement |
|--------|-----------------|---------------|---|
| Monthly Active Users | 5K | 50K | Analytics |
| API p95 Latency | 800ms | 100ms | APM (Prometheus) |
| Page Load (LCP) | 4.2s | < 2.5s | Lighthouse CI |
| Enterprise Customers | 0 | 20+ | Sales pipeline |
| Mobile Users | 0 | 30% of MAU | App analytics |
| System Uptime | 99.5% | 99.95% | Monitoring |

---

## 2. SCOPE & DELIVERABLES

### MVP (v2.0 Release)
- [x] **Product**: Enhanced cost calculator with provider API integration
  - Real-time cost data fetch from 3 major providers (OpenAI, Anthropic, Google)
  - Organization & team management with RBAC
  - Saved configurations per user/org
  - Cost alerts and notifications
  - Advanced cost trends & projections

- [x] **Engineering**: Full-stack TypeScript + Go backend with PostgreSQL
  - REST API with WebSocket real-time updates
  - JWT-based authentication with OAuth2 integration
  - PostgreSQL schema for orgs, teams, configs, audit logs
  - Redis for caching and real-time notifications
  - Docker containerization and Kubernetes ready

- [x] **Infrastructure**: Cloud-native, production-grade
  - Kubernetes manifests for staging and production
  - CI/CD pipeline with GitHub Actions
  - Prometheus/Grafana monitoring and alerting
  - TLS, secrets management, RBAC
  - Multi-region ready (roadmap)

- [x] **Quality**: Comprehensive testing and security
  - Unit test coverage ≥ 85% for critical paths
  - E2E test suite with Playwright
  - Security audit with OWASP checks
  - Performance testing with k6 load tests
  - Mobile testing (iOS/Android) with Detox

- [x] **Documentation**: Complete technical and operational
  - API OpenAPI specification
  - Architecture Decision Records (ADRs)
  - Runbooks for common operations
  - Deployment guide
  - Mobile app documentation

### Out of Scope (v2.1+)
- Multi-region deployment (planned v2.1)
- Custom invoice generation (v2.1)
- Advanced ML-based cost optimization (v2.2)
- White-label enterprise solution (v2.2)

---

## 3. TECHNICAL ARCHITECTURE

### Stack (Approved by CTO)
- **Frontend Web**: React 18, TypeScript, Vite, Tailwind CSS, React Query
- **Frontend Mobile**: React Native + Expo (iOS/Android)
- **Backend**: Go 1.21+ with chi router
- **Database**: PostgreSQL 15+ primary, Redis 7+ for caching/realtime
- **Infrastructure**: Docker, Kubernetes, Nginx, Prometheus/Grafana
- **CI/CD**: GitHub Actions with ArgoCD for gitops
- **Cloud**: AWS (EKS, RDS, ElastiCache, ECR, S3, CloudFront)
- **Security**: JWT auth, OAuth2 providers, encrypted secrets, network policies

### Key Features
1. **Real-time Provider Integration**
   - Scheduled syncs (hourly) with OpenAI Billing API
   - Webhook listeners for cost events from Anthropic
   - Google Cloud Billing connector via GCP APIs

2. **Multi-tenancy**
   - Organization isolation at database level
   - Team-based RBAC (Admin, Editor, Viewer)
   - Audit logging of all actions

3. **Advanced Analytics**
   - Cost trends (daily/weekly/monthly)
   - Predictive monthly spend based on current usage
   - Anomaly detection for unexpected cost spikes
   - Cost optimization recommendations

4. **Mobile App** (Parity with web + offline)
   - Dashboard with real-time cost metrics
   - Provider integration status
   - Notifications for alerts
   - Offline access to cached configurations

---

## 4. AGENT TEAM STRUCTURE

### Leadership Chain
```
CEO (You)
├─ CTO (cto.md)
│  ├─ Project Manager (project-manager.md)
│  ├─ Product Manager (product-manager.md)
│  └─ QA Engineer (qa-engineer.md)
│     ├─ Code Reviewer (code-reviewer.md)
│     ├─ Security Auditor (security-auditor.md)
│     └─ Performance Engineer (performance-engineer.md)
│
├─ Tech Lead (tech-lead.md)
│  ├─ Backend Developer (backend-developer.md)
│  ├─ Frontend Developer (frontend-developer.md)
│  ├─ Mobile Developer (mobile-developer.md)
│  ├─ Database Admin (database-admin.md)
│  └─ Infra Engineer (infra-engineer.md)
│
└─ DevOps Engineer (devops-engineer.md)
   ├─ Debugger (debugger.md)
   └─ Tech Writer (tech-writer.md)
```

### Agent Responsibilities Summary
| Agent | Primary Role | Key Deliverables |
|-------|--------------|------------------|
| **CTO** | Architecture, standards | ADR, tech decisions, unblocking |
| **Project Manager** | Delivery, timeline | Master plan, sprints, status |
| **Product Manager** | Requirements, UX goals | PRD, user stories, acceptance criteria |
| **UI/UX Designer** | Wireframes, design system | Screen specs, component designs, accessibility |
| **Tech Lead** | Engineering execution | API contracts, task breakdown, code reviews |
| **Backend Developer** | Server-side logic | REST API, auth, business logic, DB queries |
| **Frontend Developer** | Web UI | React components, integration, performance |
| **Mobile Developer** | iOS/Android app | React Native screens, native features |
| **Database Admin** | Schema, performance | Schema design, migrations, query optimization |
| **Infra Engineer** | Deployment configs | Dockerfiles, K8s manifests, CI/CD pipelines |
| **QA Engineer** | Test strategy | Test plan, test execution, sign-off gates |
| **Code Reviewer** | Code quality | Code reviews, standards enforcement |
| **Security Auditor** | Security | Vulnerability scans, auth audit, compliance |
| **Performance Engineer** | Speed & scale | Load testing, profiling, optimization |
| **DevOps Engineer** | Production ops | Cloud deployments, monitoring, incidents |
| **Debugger** | Troubleshooting | Bug diagnosis, root cause analysis |
| **Tech Writer** | Documentation | API docs, READMEs, runbooks, ADRs |

---

## 5. PROJECT PHASES & MILESTONES

### Phase 1: Design & Planning (Week 1-2)
- [ ] **Product Manager**: Finalize PRD with detailed user stories
- [ ] **UI/UX Designer**: Complete wireframes and design system
- [ ] **CTO**: Approve architecture ADR with Tech Lead
- [ ] **Tech Lead**: Break down engineering tasks, define API contracts
- [ ] **Database Admin**: Design normalized schema for multi-tenant model
- [ ] **Deliverables**: PRD, Wireframes, ADR, Engineering breakdown, Schema design

### Phase 2: MVP Build (Week 3-6)
- [ ] **Backend Developer**: Implement 15+ REST API endpoints
- [ ] **Frontend Developer**: Build 8+ key screens with React
- [ ] **Mobile Developer**: Implement React Native parity
- [ ] **Database Admin**: Write and test migrations
- [ ] **Infra Engineer**: Create Dockerfile, docker-compose, K8s manifests
- [ ] **Tech Writer**: Draft API documentation and Architecture docs

### Phase 3: Quality Gates (Week 7-8)
- [ ] **QA Engineer**: Execute test plan, coordinate testing phases
- [ ] **Code Reviewer**: Review all PRs against standards
- [ ] **Security Auditor**: Run security scans, audit auth/secrets
- [ ] **Performance Engineer**: Load test, profile, optimize hotspots
- [ ] **Deliverables**: Test reports, security audit, performance baselines

### Phase 4: Deployment & Launch (Week 9-10)
- [ ] **DevOps Engineer**: Deploy to staging, then production
- [ ] **Debugger**: Monitor for issues, triage any incidents
- [ ] **Tech Writer**: Finalize runbooks and deployment docs
- [ ] **Project Manager**: Coordinate go-live, communicate status
- [ ] **Deliverables**: Deployment report, runbooks, launch announcement

---

## 6. KEY DECISIONS & CONSTRAINTS

### Architectural Decisions (CTO-Approved)
1. **Multi-tenant from day 1**: Organizations isolated by `org_id` foreign key
2. **REST API + WebSocket**: REST for CRUD, WebSocket for real-time cost updates
3. **PostgreSQL primary, Redis secondary**: PostgreSQL for durable state, Redis for cache/sessions
4. **React Native code sharing**: Maximize code reuse between iOS and Android
5. **Kubernetes-native**: All services containerized, K8s manifests in git, ArgoCD for gitops

### Constraints
- **Timeline**: 10 weeks to MVP, Q2 2025 target
- **Team size**: 17 agents (fixed), no additional headcount
- **Budget**: Within existing infrastructure cost (no new vendors except necessary)
- **Browser support**: Chrome, Firefox, Safari (modern versions only)
- **Mobile targets**: iOS 14+, Android 10+
- **Uptime SLA**: 99.95% production uptime

---

## 7. RISKS & MITIGATION

### High Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Provider APIs change specs | Medium | High | Early integration test, contract-based alerts |
| Mobile QA complexity | High | Medium | Dedicated Detox suite, early testing |
| Performance regression under load | Medium | High | Load test every release, budgets enforced |
| Team coordination overhead | High | Medium | Daily standups, clear RACI, escalation paths |

### Assumptions
- Existing v1.0 codebase can be sunset (no legacy code to maintain)
- Provider API documentation is stable through launch
- Cloud infrastructure (AWS) is available and budgeted
- Team has no production on-call requirements during sprint

---

## 8. SUCCESS CRITERIA & GATE

### Pre-Launch QA Gate
- [ ] All acceptance criteria from PRD verified ✅
- [ ] Unit test coverage ≥ 85% on critical paths
- [ ] E2E test suite covering all user journeys passes
- [ ] Security audit: zero high/critical vulnerabilities
- [ ] Performance test: all SLOs met (p95 < 100ms, LCP < 2.5s)
- [ ] Smoketest in production environment successful
- [ ] Runbook documentation complete and tested
- [ ] CEO and CTO sign-off obtained

### Launch Success We'll Measure
- App is live and accessible 24/7 without incidents
- Real users connecting, using cost calculator
- No critical bugs reported in first week
- Performance metrics match production baseline
- Mobile app approved in both App Stores

---

## 9. HOW TO INVOKE THE AGENT TEAM

### Starting a Phase
1. **CEO → CTO**: "Start Phase [N] for API Calculator v2.0"
2. **CTO → All Agents**: Distribute phase tasks from this brief
3. **Tech Lead → Backend/Frontend/Mobile**: Assign specific features
4. **Project Manager**: Update sprint board, track progress

### Daily Coordination
- **Standup** (daily 10 min): Each agent reports in 30 seconds (blocked/done/next)
- **Tech Sync** (3x/week): Tech Lead with developers; CTO if blocked
- **Retro** (sprint-end): What went well, what to improve

### Invoking Specific Agents
```
@CTO → Architecture review, decisions, standards
@Product Manager → Requirements clarification, acceptance criteria
@Tech Lead → Task breakdown, API contracts, code reviews
@Backend Developer → REST API implementation
@Frontend Developer → React UI implementation
@Mobile Developer → React Native screens
@QA Engineer → Testing, quality gates, sign-off
@Code Reviewer → Code quality review
@Security Auditor → Security audit
@Performance Engineer → Load testing, optimization
@DevOps Engineer → Production deployment
@Debugger → Bug diagnosis and fixing
@Tech Writer → Documentation
@Database Admin → Schema design, optimization
@Infra Engineer → Deployment configs
@Project Manager → Timeline, blockers, status
```

---

## 10. QUICK START FOR AGENTS

1. **Read this brief** — understand the vision, scope, and your role
2. **Check your agent descriptor** — in `AGENTS/[your-role].md`
3. **Await project kickoff** — CEO will invoke Phase 1 start
4. **Join the team standup** — coordinate with peers daily
5. **Report blockers immediately** — escalate to CTO if stuck

---

**Document Version**: 1.0  
**Last Updated**: 2025-03-17  
**Next Review**: Phase 1 completion kickoff
