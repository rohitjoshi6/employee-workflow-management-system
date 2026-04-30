export type Role = "employee" | "manager" | "admin";
export type RequestType = "PTO" | "equipment" | "access" | "profile update" | "other";
export type RequestPriority = "low" | "medium" | "high";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  manager_id?: number | null;
  created_at: string;
}

export interface WorkflowRequest {
  id: number;
  title: string;
  description: string;
  request_type: RequestType;
  priority: RequestPriority;
  status: RequestStatus;
  submitted_by_id: number;
  assigned_manager_id?: number | null;
  decision_comment?: string | null;
  decided_at?: string | null;
  created_at: string;
  updated_at: string;
  submitted_by: User;
  assigned_manager?: User | null;
}

export interface AuditLog {
  id: number;
  actor_id: number;
  action: string;
  request_id: number;
  timestamp: string;
  details?: string | null;
  actor: User;
}

export interface DashboardStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  average_approval_time_hours: number;
  status_distribution: Array<{ status: RequestStatus; count: number }>;
}
