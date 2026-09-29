# NEXUS OBSERVE — Deployment & Operation Guide

## 1. Quick Local Setup

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Step 1: Install Backend & Run Database Migration
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```
Backend will start on `http://localhost:5000` with DEMO_MODE active.

### Step 2: Install Frontend & Run Dev Server
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:3000` (or `http://localhost:5173`).

---

## 2. Running via Docker Compose

```bash
docker compose up --build
```
This launches:
- Frontend on `http://localhost:80`
- Backend API on `http://localhost:5000`
- MySQL RDS mock container on `http://localhost:3306`

---

## 3. Demo Mode vs Production Mode Configuration

### Demo Mode (`DEMO_MODE=true`)
- Does not require active AWS CloudWatch or AWS S3 credentials.
- Generates realistic live telemetry fluctuations, metric sparklines, alert stream entries, and synthetic log records.

### Production Mode (`DEMO_MODE=false`)
- Connects directly to AWS CloudWatch APIs via AWS SDK v3.
- Utilizes AWS IAM Instance Roles attached to AWS EC2 or ECS tasks.
- Connects to AWS RDS MySQL DB cluster via `DATABASE_URL`.
