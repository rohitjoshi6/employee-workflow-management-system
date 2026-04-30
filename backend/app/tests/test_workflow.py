from fastapi.testclient import TestClient


def _register(client: TestClient, email: str, role: str, manager_id: int | None = None) -> dict:
    payload = {
        "name": email.split("@")[0].title(),
        "email": email,
        "password": "Password123!",
        "role": role,
    }
    if manager_id:
        payload["manager_id"] = manager_id
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def test_employee_can_create_and_cancel_request(client: TestClient) -> None:
    manager = _register(client, "manager@example.com", "manager")
    employee = _register(client, "employee@example.com", "employee", manager["user"]["id"])

    response = client.post(
        "/api/requests",
        headers={"Authorization": f"Bearer {employee['access_token']}"},
        json={
            "title": "Need keyboard",
            "description": "My keyboard is failing and needs replacement.",
            "request_type": "equipment",
            "priority": "medium",
        },
    )
    assert response.status_code == 201, response.text
    request_id = response.json()["id"]

    cancel = client.post(
        f"/api/requests/{request_id}/cancel",
        headers={"Authorization": f"Bearer {employee['access_token']}"},
    )
    assert cancel.status_code == 200, cancel.text
    assert cancel.json()["status"] == "cancelled"


def test_manager_can_approve_assigned_request(client: TestClient) -> None:
    manager = _register(client, "manager@example.com", "manager")
    employee = _register(client, "employee@example.com", "employee", manager["user"]["id"])
    created = client.post(
        "/api/requests",
        headers={"Authorization": f"Bearer {employee['access_token']}"},
        json={
            "title": "Access to CRM",
            "description": "Need CRM access to support customer migration work.",
            "request_type": "access",
            "priority": "high",
        },
    ).json()

    approval = client.post(
        f"/api/approvals/{created['id']}/approve",
        headers={"Authorization": f"Bearer {manager['access_token']}"},
    )
    assert approval.status_code == 200, approval.text
    assert approval.json()["status"] == "approved"


def test_admin_can_view_dashboard_stats(client: TestClient) -> None:
    admin = _register(client, "admin@example.com", "admin")
    stats = client.get("/api/dashboard/stats", headers={"Authorization": f"Bearer {admin['access_token']}"})
    assert stats.status_code == 200, stats.text
    assert stats.json()["total_requests"] == 0
