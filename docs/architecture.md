# Architecture

The system is split into three top-level folders:

- `/frontend`: React + TypeScript single-page application.
- `/backend`: Express + TypeScript REST API.
- `/docs`: architecture and API notes.

```mermaid
sequenceDiagram
  participant Employee
  participant Frontend
  participant API
  participant PostgreSQL
  participant Manager
  Employee->>Frontend: Submit internal request
  Frontend->>API: POST /api/requests
  API->>PostgreSQL: Insert request, approval, audit log
  Manager->>Frontend: Open approval queue
  Frontend->>API: GET /api/approvals/queue
  API->>PostgreSQL: Query pending approvals
  Manager->>API: POST /api/requests/:id/status
  API->>PostgreSQL: Update request, approval, comments, audit_logs
```

Role checks are enforced in backend middleware. The frontend exposes demo role switching, but the API still authorizes every protected route using `x-user-id`.

