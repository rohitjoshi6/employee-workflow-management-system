# Employee Workflow Management System

An enterprise-style internal workflow platform where employees submit operational requests, managers approve or reject assigned work, and admins monitor process health across the organization.

Resume bullet:

> Built a full-stack workflow platform for employees to submit requests, managers to approve tasks, and admins to track process status.

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, Axios, Bootstrap, lucide-react
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth, PostgreSQL
- Platform: Redis dashboard caching, Docker Compose, GitHub Actions CI
- Quality: backend unit tests, ruff linting, frontend TypeScript build

## Quick Start

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

Seed the database after containers are running:

```bash
docker compose exec backend python -m app.seed
```

## Demo Users

All demo users use password `Password123!`.

| Role | Email |
| --- | --- |
| Employee | `employee@example.com` |
| Manager | `manager@example.com` |
| Admin | `admin@example.com` |

## Environment Variables

Backend:

- `DATABASE_URL`: SQLAlchemy connection string
- `REDIS_URL`: Redis connection string for cached admin dashboard stats
- `JWT_SECRET_KEY`: signing secret for access tokens
- `CORS_ORIGINS`: JSON array of allowed frontend origins

Frontend:

- `VITE_API_URL`: API base URL, defaults to `http://localhost:8000/api`

Examples are included in [backend/.env.example](/Users/rohitjoshi6/Documents/Codex/2026-04-29/build-a-complete-full-stack-project/backend/.env.example) and [frontend/.env.example](/Users/rohitjoshi6/Documents/Codex/2026-04-29/build-a-complete-full-stack-project/frontend/.env.example).

## API Routes

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Users:

- `GET /api/users`
- `GET /api/users/managers`

Requests:

- `POST /api/requests`
- `GET /api/requests/my`
- `GET /api/requests`
- `GET /api/requests/{request_id}`
- `PUT /api/requests/{request_id}`
- `POST /api/requests/{request_id}/cancel`

Approvals:

- `GET /api/approvals/queue`
- `GET /api/approvals/history`
- `POST /api/approvals/{request_id}/approve`
- `POST /api/approvals/{request_id}/reject`

Audit and dashboard:

- `GET /api/audit-logs`
- `GET /api/dashboard/stats`

## Project Architecture

```text
backend/
  app/
    auth/        JWT, password hashing, role guards
    models/      SQLAlchemy user, request, audit log models
    routes/      REST API modules
    schemas/     Pydantic request/response contracts
    services/    audit logging and Redis-backed dashboard stats
    tests/       API unit tests
frontend/
  src/
    api/         Axios client
    components/  reusable layout, badges, tables, forms, states
    context/     authentication provider
    hooks/       async data hook
    pages/       role-specific workflow screens
```

## Development Commands

Backend:

```bash
cd backend
pip install -r requirements.txt
pytest app/tests
ruff check app
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
```

## Core Workflows

- Employees can create requests, review their submissions, edit pending requests, and cancel pending requests.
- Managers can see assigned pending requests, approve them, reject them with required comments, and view decision history through API routes.
- Admins can filter all requests, inspect dashboard metrics, and view status distribution backed by short-lived Redis caching.
- Every create, update, approve, reject, and cancel action writes an audit log entry.
