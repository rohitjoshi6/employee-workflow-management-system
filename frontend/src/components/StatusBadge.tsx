import type { RequestStatus } from "../types";

const labels: Record<RequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  needs_info: "Needs info"
};

export function statusLabel(status: RequestStatus) {
  return labels[status];
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`status status-${status}`}>{statusLabel(status)}</span>;
}

