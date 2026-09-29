# NEXUS OBSERVE 🚀
### Premium Enterprise-Grade Cloud DevOps Monitoring & SRE Observability Platform

> **Tagline:** See every system. Resolve every incident.

---

## 🌟 Overview
**NEXUS OBSERVE** is a unified command center for cloud infrastructure health, real-time metrics, interactive service topology mapping, monospace log exploration, and SRE incident management.

---

## 💡 Highlights & Key Features

- 🎯 **Dark-First Technical Visual Identity**: Charcoal surfaces (`#0B0E14`), subtle borders (`#1E293B`), status color semantics (Healthy Green, Warning Amber, Critical Red, Analytics Purple), and tabular monospaced numerical typography.
- 🔐 **Split Login View**: Left-hand dynamic infrastructure flow canvas; right-hand authentication form with validation and password visibility toggle.
- 📊 **Command Dashboard**:
  - **Hero System Health Gauge**: 98.7% Healthy radial status visualization with operational/degraded/critical service counts.
  - **Compact KPI Metric Cards**: Tabular numbers, trend arrows, comparison metrics, and mini sparkline graphs.
  - **Interactive Service Topology Map**: Layered dependency node map with hover state, traffic animation, pan, and click node details.
  - **Real-Time Recharts Streams**: CPU, Memory, Latency, and Error Rate metrics with time-range selectors (1H, 6H, 24H, 7D, 30D).
  - **Active Incidents & Live Alert Stream**: Priority cards with quick acknowledge actions.
- 🛠️ **Infrastructure & 4-Step Setup Wizard**:
  - Service directory table with quick actions.
  - Multi-step modal wizard (Service Info → Telemetry Monitoring → Alert Thresholds → Live JSON Configuration Preview).
- 🚨 **SRE Incident Console**: Severity badges, resolution action triggers (Acknowledge, Assign, Escalate, Resolve, Close), and resolution timeline history.
- 💻 **Monospace Terminal Log Explorer**: Stream viewer with level filtering (DEBUG, INFO, WARN, ERROR, FATAL), search keyword filtering, copy log line button, and JSON metadata expander.
- 📈 **Executive SLA Analytics**: Reliability trend graphs and CSV telemetry export generation.
- 🏆 **SRE Scorecard**: SLO compliance tracking, error budget remaining indicators, MTTR, and MTBF progress bars.
- ⌨️ **`Ctrl + K` Command Palette**: Keyboard-driven navigation across all platform features.
- 🔔 **Notification Drawer**: Unread counters and category alerts (Critical, Incident, Recovery, System).
- ☁️ **AWS S3 File Storage & Settings**: AWS CloudWatch, S3 presigned URL downloads, RDS MySQL connection status, and IAM role state.

---

## 🏗️ Technology Stack

| Domain | Stack |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router DOM |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, JWT, bcryptjs, Zod |
| **Database** | SQLite (Zero-config local) / MySQL 8.0 (AWS RDS production) |
| **Cloud Telemetry** | AWS SDK v3 (`@aws-sdk/client-cloudwatch`, `@aws-sdk/client-s3`) |
| **DevOps** | Docker, Docker Compose, Nginx, GitHub Actions CI/CD |

---

## 🚀 Quick Start Guide

### Option 1: Local Development Setup
```bash
# 1. Start Backend Server (Terminal 1)
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev

# 2. Start Frontend App (Terminal 2)
cd frontend
npm install
npm run dev
```

### Option 2: Docker Compose Setup
```bash
docker compose up --build
```
Access the application at `http://localhost:80` (or `http://localhost:3000`).

---

## 🔑 Demo SRE Credentials
- **Email**: `alex.rivera@nexusobserve.io`
- **Password**: `demo123`
- **Role**: `ADMIN` (Lead SRE)

---

## 📁 Repository Structure
```
nexus-observe/
├── backend/            # Express TypeScript API + Prisma ORM + Monitoring Engine
├── frontend/           # React 18 + Vite + Tailwind CSS + Recharts UI
├── docker/             # Dockerfiles & Nginx configuration
├── docs/               # Technical Architecture & Project Reports
└── docker-compose.yml  # Multi-container orchestration
```
