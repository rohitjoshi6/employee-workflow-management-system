# API Reference

All protected routes expect `x-user-id` to match a seeded or persisted user.

## Requests

### `GET /api/requests`

Returns request history. Employees see their own requests. Managers see requests assigned to them. Admins see all requests.

### `POST /api/requests`

Roles: employee, admin.

```json
{
  "title": "New laptop request",
  "description": "Need a laptop for onboarding.",
  "requestType": "equipment",
  "priority": "high",
  "managerId": "33333333-3333-3333-3333-333333333333",
  "dueDate": "2026-07-01"
}
```

## Approvals

### `GET /api/approvals/queue`

Roles: manager, admin. Returns pending requests awaiting review.

### `POST /api/requests/:id/status`

Roles: manager, admin.

```json
{
  "status": "approved",
  "comment": "Approved for Q3 onboarding."
}
```

Allowed statuses are `approved`, `rejected`, and `needs_info`.

## Admin

### `GET /api/admin/audit-logs`

Roles: admin. Returns audit events with actor and request context.

### `GET /api/admin/metrics`

Roles: admin. Returns request totals by status, average approval hours, pending count, and completed count.

