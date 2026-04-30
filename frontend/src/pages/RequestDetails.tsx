import { Save } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../api/client";
import { LoadingState } from "../components/LoadingState";
import { RequestForm, type RequestFormValues } from "../components/RequestForm";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import type { AuditLog, WorkflowRequest } from "../types";

export function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const request = useAsyncData<WorkflowRequest>(async () => (await api.get(`/requests/${id}`)).data, [id, editing]);
  const audits = useAsyncData<AuditLog[]>(async () => (await api.get(`/audit-logs?request_id=${id}`)).data, [id, editing]);

  async function handleUpdate(values: RequestFormValues) {
    await api.put(`/requests/${id}`, values);
    setEditing(false);
  }

  if (request.loading) return <LoadingState label="Loading request" />;
  if (request.error || !request.data) return <div className="alert alert-danger">Unable to load request.</div>;
  const item = request.data;
  const canEdit = item.status === "pending" && (item.submitted_by_id === user?.id || user?.role === "admin");

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>{item.title}</h2>
          <p>Submitted by {item.submitted_by.name} for {item.assigned_manager?.name ?? "unassigned manager"}.</p>
        </div>
        {canEdit && (
          <button className="btn btn-outline-primary" onClick={() => setEditing(!editing)}>
            <Save size={16} /> {editing ? "View details" : "Edit pending request"}
          </button>
        )}
      </div>
      {editing ? (
        <RequestForm initialRequest={item} submitLabel="Save changes" onSubmit={handleUpdate} />
      ) : (
        <section className="detail-grid">
          <div className="detail-main">
            <div className="detail-meta">
              <StatusBadge status={item.status} />
              <PriorityBadge priority={item.priority} />
              <span>{item.request_type}</span>
            </div>
            <p>{item.description}</p>
            {item.decision_comment && <div className="decision-note"><strong>Decision note</strong><p>{item.decision_comment}</p></div>}
          </div>
          <aside className="detail-side">
            <dl>
              <dt>Created</dt><dd>{new Date(item.created_at).toLocaleString()}</dd>
              <dt>Updated</dt><dd>{new Date(item.updated_at).toLocaleString()}</dd>
              <dt>Request ID</dt><dd>#{item.id}</dd>
            </dl>
          </aside>
        </section>
      )}
      <section className="audit-surface">
        <h3>Audit Log</h3>
        {audits.loading && <LoadingState label="Loading audit log" />}
        {(audits.data ?? []).map((entry) => (
          <div className="audit-row" key={entry.id}>
            <div>
              <strong>{entry.action.replaceAll("_", " ")}</strong>
              <span>{entry.actor.name} · {new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            <p>{entry.details}</p>
          </div>
        ))}
      </section>
      <button className="btn btn-outline-secondary align-self-start" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}
