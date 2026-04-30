import { Link } from "react-router-dom";

import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { RequestTable } from "../components/RequestTable";
import { useAuth } from "../context/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import type { WorkflowRequest } from "../types";

export function Dashboard() {
  const { user } = useAuth();
  const endpoint = user?.role === "admin" ? "/requests" : user?.role === "manager" ? "/approvals/queue" : "/requests/my";
  const { data, loading, error } = useAsyncData<WorkflowRequest[]>(async () => (await api.get(endpoint)).data, [endpoint]);
  const requests = data ?? [];
  const pending = requests.filter((request) => request.status === "pending").length;

  return (
    <div className="page-stack">
      <section className="summary-grid">
        <div className="metric-card">
          <span>Visible requests</span>
          <strong>{requests.length}</strong>
        </div>
        <div className="metric-card">
          <span>Pending action</span>
          <strong>{pending}</strong>
        </div>
        <div className="metric-card">
          <span>Role</span>
          <strong className="text-capitalize">{user?.role}</strong>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <h2>{user?.role === "manager" ? "Approval queue" : "Recent requests"}</h2>
          <p>Operational work items that matter for your role.</p>
        </div>
        <Link className="btn btn-primary" to="/requests/new">New request</Link>
      </div>
      {loading && <LoadingState />}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && requests.length === 0 && <EmptyState title="No workflow items" detail="Requests will appear here as soon as they are created." />}
      {!loading && requests.length > 0 && <RequestTable requests={requests.slice(0, 6)} />}
    </div>
  );
}
