import type { AuditLog, DemoUser, WorkflowRequest } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const demoUsers: DemoUser[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Maya Patel", role: "employee", department: "Engineering" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Elena Garcia", role: "manager", department: "Operations" },
  { id: "44444444-4444-4444-4444-444444444444", name: "Priya Shah", role: "admin", department: "People Ops" }
];

async function request<T>(path: string, userId: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      ...init?.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message);
  }

  return response.json() as Promise<T>;
}

export function fetchRequests(userId: string) {
  return request<WorkflowRequest[]>("/requests", userId);
}

export function fetchApprovalQueue(userId: string) {
  return request<WorkflowRequest[]>("/approvals/queue", userId);
}

export function createWorkflowRequest(userId: string, body: Record<string, unknown>) {
  return request<WorkflowRequest>("/requests", userId, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function updateRequestStatus(userId: string, requestId: string, body: Record<string, unknown>) {
  return request<WorkflowRequest>(`/requests/${requestId}/status`, userId, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function fetchAuditLogs(userId: string) {
  return request<AuditLog[]>("/admin/audit-logs", userId);
}

export function fetchMetrics(userId: string) {
  return request<{ byStatus: { status: string; count: number }[]; pending_count: number; completed_count: number; average_approval_hours: number }>("/admin/metrics", userId);
}

