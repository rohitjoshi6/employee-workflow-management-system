import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { RequestForm, type RequestFormValues } from "../components/RequestForm";
import type { WorkflowRequest } from "../types";

export function CreateRequest() {
  const navigate = useNavigate();

  async function handleSubmit(values: RequestFormValues) {
    const response = await api.post<WorkflowRequest>("/requests", values);
    navigate(`/requests/${response.data.id}`);
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>Create Request</h2>
          <p>Submit a structured workflow item for manager review.</p>
        </div>
      </div>
      <RequestForm submitLabel="Submit request" onSubmit={handleSubmit} />
    </div>
  );
}
