import { Check, X } from "lucide-react";
import { useState } from "react";

import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { RequestTable } from "../components/RequestTable";
import { useAsyncData } from "../hooks/useAsyncData";
import type { WorkflowRequest } from "../types";

export function ManagerQueue() {
  const { data, loading, error, setData } = useAsyncData<WorkflowRequest[]>(async () => (await api.get("/approvals/queue")).data, []);
  const [rejecting, setRejecting] = useState<WorkflowRequest | null>(null);
  const [comment, setComment] = useState("");
  const requests = data ?? [];

  async function approve(request: WorkflowRequest) {
    await api.post(`/approvals/${request.id}/approve`);
    setData(requests.filter((item) => item.id !== request.id));
  }

  async function reject() {
    if (!rejecting || comment.trim().length < 3) return;
    await api.post(`/approvals/${rejecting.id}/reject`, { comment });
    setData(requests.filter((item) => item.id !== rejecting.id));
    setRejecting(null);
    setComment("");
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>Manager Queue</h2>
          <p>Review assigned requests and record approval decisions with a clear audit trail.</p>
        </div>
      </div>
      {loading && <LoadingState />}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && requests.length === 0 && <EmptyState title="Queue is clear" detail="Pending requests assigned to you will appear here." />}
      {!loading && requests.length > 0 && (
        <RequestTable
          requests={requests}
          actions={(request) => (
            <>
              <button className="icon-btn success" onClick={() => void approve(request)} title="Approve" aria-label="Approve">
                <Check size={16} />
              </button>
              <button className="icon-btn danger" onClick={() => setRejecting(request)} title="Reject" aria-label="Reject">
                <X size={16} />
              </button>
            </>
          )}
        />
      )}
      {rejecting && (
        <div className="modal-backdrop-custom">
          <section className="dialog">
            <h2>Reject request</h2>
            <p>{rejecting.title}</p>
            <textarea
              className="form-control"
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Required decision comment"
            />
            <div className="form-actions">
              <button className="btn btn-outline-secondary" onClick={() => setRejecting(null)}>Close</button>
              <button className="btn btn-danger" onClick={() => void reject()} disabled={comment.trim().length < 3}>Reject</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
