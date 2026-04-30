import { useEffect, useState, type FormEvent } from "react";

import { api } from "../api/client";
import type { RequestPriority, RequestType, User, WorkflowRequest } from "../types";

export interface RequestFormValues {
  title: string;
  description: string;
  request_type: RequestType;
  priority: RequestPriority;
  assigned_manager_id?: number;
}

const initialValues: RequestFormValues = {
  title: "",
  description: "",
  request_type: "PTO",
  priority: "medium"
};

export function RequestForm({
  initialRequest,
  submitLabel,
  onSubmit
}: {
  initialRequest?: WorkflowRequest;
  submitLabel: string;
  onSubmit: (values: RequestFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<RequestFormValues>(() =>
    initialRequest
      ? {
          title: initialRequest.title,
          description: initialRequest.description,
          request_type: initialRequest.request_type,
          priority: initialRequest.priority,
          assigned_manager_id: initialRequest.assigned_manager_id ?? undefined
        }
      : initialValues
  );
  const [managers, setManagers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<User[]>("/users/managers").then((response) => setManagers(response.data)).catch(() => setManagers([]));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (values.title.trim().length < 3 || values.description.trim().length < 10) {
      setError("Add a clear title and a description of at least 10 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to save request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-surface" onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={values.title}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
            required
            minLength={3}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            value={values.request_type}
            onChange={(event) => setValues({ ...values, request_type: event.target.value as RequestType })}
          >
            <option value="PTO">PTO</option>
            <option value="equipment">Equipment</option>
            <option value="access">Access</option>
            <option value="profile update">Profile update</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            value={values.priority}
            onChange={(event) => setValues({ ...values, priority: event.target.value as RequestPriority })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Manager</label>
          <select
            className="form-select"
            value={values.assigned_manager_id ?? ""}
            onChange={(event) =>
              setValues({ ...values, assigned_manager_id: event.target.value ? Number(event.target.value) : undefined })
            }
          >
            <option value="">Auto assign</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={6}
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
            required
            minLength={10}
          />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
