import { CheckCircle2, Clock3, ClipboardList, History, ShieldCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createWorkflowRequest,
  demoUsers,
  fetchApprovalQueue,
  fetchAuditLogs,
  fetchMetrics,
  fetchRequests,
  updateRequestStatus
} from "./api";
import { DashboardCard } from "./components/DashboardCard";
import { RequestForm } from "./components/RequestForm";
import { RequestTable } from "./components/RequestTable";
import type { AuditLog, DemoUser, WorkflowRequest } from "./types";

export function App() {
  const [currentUser, setCurrentUser] = useState<DemoUser>(demoUsers[0]);
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [queue, setQueue] = useState<WorkflowRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState({ pending_count: 0, completed_count: 0, average_approval_hours: 0, byStatus: [] as { status: string; count: number }[] });
  const [error, setError] = useState("");

  const completedCount = useMemo(() => requests.filter((request) => ["approved", "rejected"].includes(request.status)).length, [requests]);

  async function loadData(user = currentUser) {
    setError("");
    try {
      const requestData = await fetchRequests(user.id);
      setRequests(requestData);

      if (user.role !== "employee") {
        setQueue(await fetchApprovalQueue(user.id));
      } else {
        setQueue([]);
      }

      if (user.role === "admin") {
        setAuditLogs(await fetchAuditLogs(user.id));
        setMetrics(await fetchMetrics(user.id));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load workflow data");
    }
  }

  useEffect(() => {
    void loadData(currentUser);
  }, [currentUser]);

  async function submitRequest(payload: Record<string, unknown>) {
    await createWorkflowRequest(currentUser.id, payload);
    await loadData();
  }

  async function decide(request: WorkflowRequest, status: "approved" | "rejected" | "needs_info") {
    const comment = status === "approved" ? "Approved from manager dashboard." : "Reviewed from manager dashboard.";
    await updateRequestStatus(currentUser.id, request.id, { status, comment });
    await loadData();
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <p className="eyebrow">Internal operations</p>
          <h1>Employee Workflow Management</h1>
        </div>
        <label className="user-switcher">
          Active role
          <select
            value={currentUser.id}
            onChange={(event) => setCurrentUser(demoUsers.find((user) => user.id === event.target.value) ?? demoUsers[0])}
          >
            {demoUsers.map((user) => (
              <option value={user.id} key={user.id}>
                {user.name} - {user.role}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <section className="metric-grid">
        <DashboardCard title="Visible requests" value={requests.length} icon={<ClipboardList size={22} />} />
        <DashboardCard title="Pending approvals" value={queue.length} icon={<Clock3 size={22} />} />
        <DashboardCard title="Completed" value={currentUser.role === "admin" ? metrics.completed_count : completedCount} icon={<CheckCircle2 size={22} />} />
        <DashboardCard title="Role" value={currentUser.role} icon={currentUser.role === "admin" ? <ShieldCheck size={22} /> : <Users size={22} />} />
      </section>

      {currentUser.role === "employee" ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Submit request</h2>
          </div>
          <RequestForm onSubmit={submitRequest} />
        </section>
      ) : null}

      {currentUser.role !== "employee" ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Pending approvals</h2>
          </div>
          <RequestTable
            requests={queue}
            action={(request) => (
              <div className="action-row">
                <button title="Approve request" onClick={() => void decide(request, "approved")}>Approve</button>
                <button title="Request more information" onClick={() => void decide(request, "needs_info")}>Info</button>
                <button title="Reject request" className="danger" onClick={() => void decide(request, "rejected")}>Reject</button>
              </div>
            )}
          />
        </section>
      ) : null}

      <section className="panel">
        <div className="section-heading">
          <h2>Request history</h2>
          <History size={18} />
        </div>
        <RequestTable requests={requests} />
      </section>

      {currentUser.role === "admin" ? (
        <section className="panel two-column">
          <div>
            <div className="section-heading">
              <h2>Workflow metrics</h2>
            </div>
            <div className="metrics-list">
              <span>Pending: {metrics.pending_count}</span>
              <span>Completed: {metrics.completed_count}</span>
              <span>Average approval: {metrics.average_approval_hours}h</span>
              {metrics.byStatus.map((item) => <span key={item.status}>{item.status}: {item.count}</span>)}
            </div>
          </div>
          <div>
            <div className="section-heading">
              <h2>Audit history</h2>
            </div>
            <ul className="audit-list">
              {auditLogs.map((log) => (
                <li key={log.id}>
                  <strong>{log.action}</strong>
                  <span>{log.actor_name ?? "System"} on {log.request_title ?? "deleted request"}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}

