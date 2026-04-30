import { Eye } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { PriorityBadge, StatusBadge } from "./StatusBadge";
import type { WorkflowRequest } from "../types";

export function RequestTable({
  requests,
  actions
}: {
  requests: WorkflowRequest[];
  actions?: (request: WorkflowRequest) => ReactNode;
}) {
  return (
    <div className="table-responsive data-surface">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th>Request</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Employee</th>
            <th>Manager</th>
            <th>Updated</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>
                <strong>{request.title}</strong>
                <span className="muted-line">#{request.id}</span>
              </td>
              <td>{request.request_type}</td>
              <td>
                <PriorityBadge priority={request.priority} />
              </td>
              <td>
                <StatusBadge status={request.status} />
              </td>
              <td>{request.submitted_by.name}</td>
              <td>{request.assigned_manager?.name ?? "Unassigned"}</td>
              <td>{new Date(request.updated_at).toLocaleDateString()}</td>
              <td className="text-end action-cell">
                <Link className="icon-btn" to={`/requests/${request.id}`} title="View details" aria-label="View details">
                  <Eye size={16} />
                </Link>
                {actions?.(request)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
