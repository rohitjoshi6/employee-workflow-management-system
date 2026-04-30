import { Ban } from "lucide-react";

import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { RequestTable } from "../components/RequestTable";
import { useAsyncData } from "../hooks/useAsyncData";
import type { WorkflowRequest } from "../types";

export function MyRequests() {
  const { data, loading, error, setData } = useAsyncData<WorkflowRequest[]>(async () => (await api.get("/requests/my")).data, []);
  const requests = data ?? [];

  async function cancelRequest(request: WorkflowRequest) {
    const response = await api.post<WorkflowRequest>(`/requests/${request.id}/cancel`);
    setData(requests.map((item) => (item.id === request.id ? response.data : item)));
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>My Requests</h2>
          <p>Track submissions, revise pending items, and cancel requests that are no longer needed.</p>
        </div>
      </div>
      {loading && <LoadingState />}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && requests.length === 0 && <EmptyState title="No requests submitted" detail="Create a request to start an approval workflow." />}
      {!loading && requests.length > 0 && (
        <RequestTable
          requests={requests}
          actions={(request) =>
            request.status === "pending" ? (
              <button className="icon-btn danger" onClick={() => void cancelRequest(request)} title="Cancel request" aria-label="Cancel request">
                <Ban size={16} />
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
}
