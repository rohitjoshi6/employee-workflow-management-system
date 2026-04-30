import { useMemo, useState } from "react";

import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { RequestTable } from "../components/RequestTable";
import { useAsyncData } from "../hooks/useAsyncData";
import type { DashboardStats, RequestPriority, RequestStatus, RequestType, User, WorkflowRequest } from "../types";

export function AdminDashboard() {
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [requestType, setRequestType] = useState<RequestType | "">("");
  const [priority, setPriority] = useState<RequestPriority | "">("");
  const [employeeId, setEmployeeId] = useState("");
  const [managerId, setManagerId] = useState("");
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (requestType) params.set("request_type", requestType);
    if (priority) params.set("priority", priority);
    if (employeeId) params.set("employee_id", employeeId);
    if (managerId) params.set("manager_id", managerId);
    return params.toString();
  }, [status, requestType, priority, employeeId, managerId]);

  const stats = useAsyncData<DashboardStats>(async () => (await api.get("/dashboard/stats")).data, []);
  const requests = useAsyncData<WorkflowRequest[]>(async () => (await api.get(`/requests${query ? `?${query}` : ""}`)).data, [query]);
  const users = useAsyncData<User[]>(async () => (await api.get("/users")).data, []);
  const maxDistribution = Math.max(...(stats.data?.status_distribution.map((item) => item.count) ?? [1]), 1);

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Monitor process health across all employee workflows.</p>
        </div>
      </div>
      {stats.loading && <LoadingState label="Loading dashboard" />}
      {stats.data && (
        <>
          <section className="summary-grid">
            <div className="metric-card"><span>Total</span><strong>{stats.data.total_requests}</strong></div>
            <div className="metric-card"><span>Pending</span><strong>{stats.data.pending_requests}</strong></div>
            <div className="metric-card"><span>Approved</span><strong>{stats.data.approved_requests}</strong></div>
            <div className="metric-card"><span>Rejected</span><strong>{stats.data.rejected_requests}</strong></div>
            <div className="metric-card"><span>Avg approval hours</span><strong>{stats.data.average_approval_time_hours}</strong></div>
          </section>
          <section className="chart-surface">
            <h3>Status distribution</h3>
            {stats.data.status_distribution.map((item) => (
              <div className="bar-row" key={item.status}>
                <span>{item.status}</span>
                <div className="bar-track"><div style={{ width: `${(item.count / maxDistribution) * 100}%` }} /></div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </section>
        </>
      )}
      <section className="filter-bar">
        <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value as RequestStatus | "")}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="form-select" value={requestType} onChange={(event) => setRequestType(event.target.value as RequestType | "")}>
          <option value="">All types</option>
          <option value="PTO">PTO</option>
          <option value="equipment">Equipment</option>
          <option value="access">Access</option>
          <option value="profile update">Profile update</option>
          <option value="other">Other</option>
        </select>
        <select className="form-select" value={priority} onChange={(event) => setPriority(event.target.value as RequestPriority | "")}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className="form-select" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
          <option value="">All employees</option>
          {(users.data ?? []).filter((user) => user.role === "employee").map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
        <select className="form-select" value={managerId} onChange={(event) => setManagerId(event.target.value)}>
          <option value="">All managers</option>
          {(users.data ?? []).filter((user) => user.role === "manager").map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
      </section>
      {requests.loading && <LoadingState />}
      {requests.error && <div className="alert alert-danger">{requests.error}</div>}
      {!requests.loading && (requests.data ?? []).length === 0 && <EmptyState title="No matching requests" detail="Adjust filters to broaden the operational view." />}
      {!requests.loading && (requests.data ?? []).length > 0 && <RequestTable requests={requests.data ?? []} />}
    </div>
  );
}
