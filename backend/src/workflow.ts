import type { RequestStatus } from "./types.js";

const terminalStatuses = new Set<RequestStatus>(["approved", "rejected"]);
const allowedManagerUpdates = new Set<RequestStatus>(["approved", "rejected", "needs_info"]);

export function canTransitionRequest(current: RequestStatus, next: RequestStatus): boolean {
  if (terminalStatuses.has(current)) {
    return false;
  }

  return allowedManagerUpdates.has(next);
}

export function toAuditAction(status: RequestStatus): string {
  return `request.${status}`;
}

