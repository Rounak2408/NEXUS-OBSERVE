# PROJECT REPORT: NEXUS OBSERVE
## Enterprise-Grade Cloud DevOps Monitoring & SRE Incident Management Platform

---

### EXECUTIVE SUMMARY
NEXUS OBSERVE is a unified cloud observability, telemetry monitoring, and SRE incident management command center designed for modern cloud-native enterprises. Built using React 18, TypeScript, Vite, Tailwind CSS, Express, Prisma ORM, and AWS SDK v3, NEXUS OBSERVE offers real-time infrastructure dependency mapping, interactive topology graph visualization, monospace log exploration, executive SLA compliance scorecards, and multi-step service onboarding.

---

### 1. SYSTEM OBJECTIVES & SCOPE
- **Unified Command Center**: Eliminate telemetry silos across infrastructure health, server metrics, application logs, and active incidents.
- **Microservice Dependency Mapping**: Provide interactive, layered service topology visualization with animated traffic flows and real-time status indication.
- **SRE Reliability Scorecard**: Automate Service Level Objective (SLO), Service Level Indicator (SLI), and Error Budget tracking with MTTR and MTBF metrics.
- **Security & AWS Cloud Native Integration**: Support AWS CloudWatch telemetry ingestion, AWS S3 presigned URL log archive downloads, and IAM role authentication.

---

### 2. SYSTEM ARCHITECTURE & TECH STACK

#### Frontend Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling & System Design**: Tailwind CSS dark visual system (Charcoal `#0B0E14`, elevated `#121722`, crisp borders `#1E293B`)
- **Data Visualization**: Recharts, SVG/Canvas topology renderer, Tabular numeric formatting
- **Icons & Primitives**: Lucide React, Custom Command Palette (`Ctrl+K`), Responsive AppShell

#### Backend Stack
- **Server**: Node.js + Express + TypeScript
- **ORM & Data**: Prisma ORM with SQLite (dev zero-config) / MySQL (AWS RDS production)
- **AWS Integrations**: `@aws-sdk/client-cloudwatch`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- **Security**: JWT authentication, bcrypt password hashing, Role-Based Access Control (RBAC: ADMIN, DEVOPS_ENGINEER, VIEWER)

---

### 3. KEY FEATURES & CAPABILITIES
1. **Split Login View**: Infrastructure topology canvas visualizer alongside elegant authenticated access.
2. **Command Dashboard**: Hero system health gauge (98.7% Healthy), compact KPI cards with sparklines, interactive topology node map, real-time Recharts streams, priority incidents & live alert feed.
3. **Infrastructure Management & 4-Step Wizard**: Service registration wizard with step-by-step threshold configuration and live JSON preview.
4. **SRE Incident Console**: Incident severity classification, timeline history tracking, and resolution action workflows (Acknowledge, Escalate, Resolve).
5. **Monospace Terminal Log Explorer**: Stream log viewer with severity filtering (INFO, WARN, ERROR, DEBUG), keyword regex search, and JSON metadata expanders.
6. **Executive Analytics & CSV Export**: Long-term SLA reliability trends and raw telemetry CSV export generation.
7. **SRE Scorecard**: Real-time compliance tracking against availability targets and error budgets.

---

### 4. CONCLUSION & PORTFOLIO IMPACT
NEXUS OBSERVE fulfills all commercial SaaS visual standards, operational reliability requirements, and technical depth necessary for demonstrating enterprise Cloud & SRE capabilities.
