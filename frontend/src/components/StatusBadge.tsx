import type { RequestPriority, RequestStatus } from "../types";

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return <span className={`priority-badge priority-${priority}`}>{priority}</span>;
}
