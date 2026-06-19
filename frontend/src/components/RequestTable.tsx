import { StatusBadge } from "./StatusBadge";
import type { WorkflowRequest } from "../types";
import type { ReactNode } from "react";

interface RequestTableProps {
  requests: WorkflowRequest[];
  action?: (request: WorkflowRequest) => ReactNode;
}

export function RequestTable({ requests, action }: RequestTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Request</th>
            <th>Requester</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due</th>
            {action ? <th>Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>
                <strong>{request.title}</strong>
                <span>{request.description}</span>
              </td>
              <td>{request.requester_name}</td>
              <td>{request.request_type}</td>
              <td className="capitalize">{request.priority}</td>
              <td><StatusBadge status={request.status} /></td>
              <td>{request.due_date ? new Date(request.due_date).toLocaleDateString() : "Flexible"}</td>
              {action ? <td>{action(request)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
