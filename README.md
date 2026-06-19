# Employee Workflow Management System

A full-stack internal workflow management system for employees, managers, and admins. The application models a common workplace process: employees submit internal requests, managers review and comment on approvals, and admins monitor request health through audit history and operational metrics.

Repository: [https://github.com/rohitjoshi6/employee-workflow-management-system](https://github.com/rohitjoshi6/employee-workflow-management-system)

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Architecture](#architecture)
- [Role-Based Workflow](#role-based-workflow)
- [Database Design](#database-design)
- [Request Lifecycle](#request-lifecycle)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Demo Users](#demo-users)
- [API Reference](#api-reference)
- [Frontend Experience](#frontend-experience)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)

## Overview

This project is designed as an internal operations tool where request handling needs to be transparent, auditable, and role-aware. It includes a React dashboard for day-to-day workflows, a Node.js/Express REST API for business operations, and a PostgreSQL schema that captures users, roles, requests, approvals, comments, and audit logs.

The current demo authentication model uses an `x-user-id` request header so the application can demonstrate role-based access without requiring a full identity provider. That keeps the project easy to run locally while preserving the same authorization boundaries a production system would enforce behind SSO or OAuth.

## Core Capabilities

- Employees can submit internal requests with request type, priority, description, manager assignment, and due date.
- Employees can view their own request history and status changes.
- Managers can view their pending approval queue.
- Managers can approve, reject, or request more information on assigned requests.
- Managers and admins can attach comments during status transitions.
- Admins can view all request activity across the organization.
- Admins can inspect audit logs for request creation and status changes.
- Admins can track workflow metrics including pending count, completed count, and average approval time.
- Backend authorization enforces employee, manager, and admin access rules.
- PostgreSQL seed data provides realistic users and sample requests.

## Architecture

```mermaid
flowchart LR
  Browser["Browser\nReact + TypeScript"] --> Vite["Vite Dev Server\nlocalhost:5173"]
  Vite --> API["Express REST API\nlocalhost:4000/api"]
  API --> Auth["Auth Middleware\nx-user-id + role checks"]
  API --> Services["Workflow Logic\nstatus transitions + audit events"]
  Services --> DB[("PostgreSQL\nworkflow_management")]
  DB --> Schema["roles\nusers\nrequests\napprovals\ncomments\naudit_logs"]
```

```mermaid
sequenceDiagram
  participant Employee
  participant Frontend
  participant API
  participant Database
  participant Manager

  Employee->>Frontend: Submit internal request
  Frontend->>API: POST /api/requests
  API->>API: Validate payload and role
  API->>Database: Insert request, approval, audit log
  Database-->>API: Created request
  API-->>Frontend: 201 Created

  Manager->>Frontend: Open approval queue
  Frontend->>API: GET /api/approvals/queue
  API->>Database: Load pending approvals
  Database-->>API: Assigned requests
  API-->>Frontend: Pending approval list

  Manager->>Frontend: Approve, reject, or request info
  Frontend->>API: POST /api/requests/:id/status
  API->>API: Enforce transition rules
  API->>Database: Update request, approval, comments, audit log
  Database-->>API: Updated request
  API-->>Frontend: Updated status
```

## Role-Based Workflow

```mermaid
flowchart TD
  Start["User opens dashboard"] --> Role{"Current role"}
  Role --> Employee["Employee view"]
  Role --> Manager["Manager view"]
  Role --> Admin["Admin view"]

  Employee --> Submit["Submit request"]
  Employee --> OwnHistory["View own request history"]

  Manager --> Queue["View assigned pending approvals"]
  Manager --> Decision{"Decision"}
  Decision --> Approve["Approve request"]
  Decision --> Reject["Reject request"]
  Decision --> NeedsInfo["Request more information"]
  Approve --> Audit["Write audit log"]
  Reject --> Audit
  NeedsInfo --> Audit

  Admin --> AllRequests["View all requests"]
  Admin --> Metrics["View workflow metrics"]
  Admin --> Logs["Inspect audit history"]
```

## Database Design

The schema is defined in [`backend/db/schema.sql`](backend/db/schema.sql), and demo records are defined in [`backend/db/seed.sql`](backend/db/seed.sql).

```mermaid
erDiagram
  roles ||--o{ users : assigns
  users ||--o{ users : manages
  users ||--o{ requests : submits
  users ||--o{ requests : manages
  requests ||--o{ approvals : has
  users ||--o{ approvals : decides
  requests ||--o{ comments : has
  users ||--o{ comments : writes
  requests ||--o{ audit_logs : records
  users ||--o{ audit_logs : performs

  roles {
    uuid id PK
    text name
    text description
  }

  users {
    uuid id PK
    uuid role_id FK
    uuid manager_id FK
    text name
    text email
    text department
    timestamptz created_at
  }

  requests {
    uuid id PK
    uuid requester_id FK
    uuid manager_id FK
    text title
    text description
    text request_type
    text priority
    text status
    date due_date
    timestamptz created_at
    timestamptz updated_at
    timestamptz completed_at
  }

  approvals {
    uuid id PK
    uuid request_id FK
    uuid approver_id FK
    text status
    timestamptz decided_at
    timestamptz created_at
  }

  comments {
    uuid id PK
    uuid request_id FK
    uuid author_id FK
    text body
    timestamptz created_at
  }

  audit_logs {
    uuid id PK
    uuid request_id FK
    uuid actor_id FK
    text action
    text previous_status
    text new_status
    jsonb metadata
    timestamptz created_at
  }
```

## Request Lifecycle

```mermaid
stateDiagram-v2
  [*] --> pending: Employee creates request
  pending --> approved: Manager/Admin approves
  pending --> rejected: Manager/Admin rejects
  pending --> needs_info: Manager/Admin requests details
  needs_info --> approved: Manager/Admin approves later
  needs_info --> rejected: Manager/Admin rejects later
  approved --> [*]
  rejected --> [*]
```

Status transitions are guarded in the backend. Terminal statuses such as `approved` and `rejected` cannot be changed again by the current workflow logic.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Validation | Zod |
| Database Driver | `pg` |
| Tests | Vitest, Supertest-ready backend test setup, React component test |
| Local Services | Docker Compose |
| CI | GitHub Actions |

## Project Structure

```text
.
|-- backend
|   |-- db
|   |   |-- schema.sql
|   |   `-- seed.sql
|   |-- src
|   |   |-- middleware
|   |   |-- routes
|   |   |-- app.ts
|   |   |-- db.ts
|   |   |-- server.ts
|   |   |-- types.ts
|   |   `-- workflow.ts
|   `-- tests
|-- docs
|   |-- api.md
|   `-- architecture.md
|-- frontend
|   |-- src
|   |   |-- components
|   |   |-- api.ts
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   |-- styles.css
|   |   `-- types.ts
|   `-- index.html
|-- docker-compose.yml
|-- package.json
`-- README.md
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Files

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

Docker Compose starts PostgreSQL and loads the schema plus seed data from the backend SQL files.

### 4. Start the API

```bash
npm run dev:backend
```

The API runs at `http://localhost:4000/api`.

### 5. Start the Frontend

Open a second terminal:

```bash
npm run dev:frontend
```

The frontend runs at `http://localhost:5173`.

## Environment Variables

Root `.env.example`:

```bash
DATABASE_URL=postgres://workflow:workflow@localhost:5432/workflow_management
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:4000/api
```

Backend:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by the Express API |
| `PORT` | API server port |
| `FRONTEND_ORIGIN` | Allowed CORS origin |

Frontend:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL for REST API requests |

## Demo Users

The demo app uses the `x-user-id` header to identify a user. The frontend role switcher selects one of these seeded users and sends the matching header.

| Role | User | Department | ID |
| --- | --- | --- | --- |
| Employee | Maya Patel | Engineering | `11111111-1111-1111-1111-111111111111` |
| Employee | Noah Kim | Finance | `22222222-2222-2222-2222-222222222222` |
| Manager | Elena Garcia | Operations | `33333333-3333-3333-3333-333333333333` |
| Admin | Priya Shah | People Ops | `44444444-4444-4444-4444-444444444444` |

## API Reference

All protected endpoints require an `x-user-id` header.

| Method | Route | Roles | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Returns API health status |
| `GET` | `/api/auth/me` | Employee, manager, admin | Returns the authenticated demo user |
| `GET` | `/api/requests` | Employee, manager, admin | Returns role-filtered request history |
| `POST` | `/api/requests` | Employee, admin | Creates an internal request |
| `GET` | `/api/approvals/queue` | Manager, admin | Returns pending approvals |
| `POST` | `/api/requests/:id/status` | Manager, admin | Updates request status and optionally writes a comment |
| `GET` | `/api/admin/audit-logs` | Admin | Returns recent audit log entries |
| `GET` | `/api/admin/metrics` | Admin | Returns status counts and workflow timing metrics |

Example request creation:

```bash
curl -X POST http://localhost:4000/api/requests \
  -H "Content-Type: application/json" \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -d '{
    "title": "New monitor request",
    "description": "Requesting a second monitor for development work.",
    "requestType": "equipment",
    "priority": "medium",
    "managerId": "33333333-3333-3333-3333-333333333333",
    "dueDate": "2026-07-15"
  }'
```

Example approval:

```bash
curl -X POST http://localhost:4000/api/requests/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: 33333333-3333-3333-3333-333333333333" \
  -d '{
    "status": "approved",
    "comment": "Approved for the current quarter."
  }'
```

For additional route notes, see [`docs/api.md`](docs/api.md).

## Frontend Experience

The React UI is organized around role-specific dashboards:

- Employee view: metric cards, request submission form, and request history.
- Manager view: pending approval queue with approve, reject, and request-info actions.
- Admin view: request history, workflow metrics, and audit log activity.

Reusable components live in `frontend/src/components`:

- `DashboardCard.tsx`
- `RequestForm.tsx`
- `RequestTable.tsx`
- `StatusBadge.tsx`

## Testing

Run all tests:

```bash
npm test
```

Run a production build:

```bash
npm run build
```

Current test coverage includes:

- Backend workflow transition rules.
- Backend audit action formatting.
- Frontend status label rendering logic.

## Screenshots

Add screenshots after running the app locally:

- Employee dashboard and request form.
- Manager pending approval queue.
- Admin metrics and audit history.

## Troubleshooting

### PostgreSQL Port Already In Use

If port `5432` is already used by another local database, change the host port in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

Then update `DATABASE_URL`:

```bash
DATABASE_URL=postgres://workflow:workflow@localhost:5433/workflow_management
```

### Seed Data Did Not Load

The schema and seed files run when the PostgreSQL volume is first created. To recreate the database from scratch:

```bash
docker compose down -v
docker compose up -d
```

### API Returns `Missing x-user-id header`

Protected routes require a seeded user ID in the `x-user-id` header. Use one of the demo users listed above, or select a role from the frontend role switcher.
