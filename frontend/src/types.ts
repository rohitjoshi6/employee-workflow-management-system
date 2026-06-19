export type RoleName = "employee" | "manager" | "admin";
export type RequestStatus = "pending" | "approved" | "rejected" | "needs_info";

export interface DemoUser {
  id: string;
  name: string;
  role: RoleName;
  department: string;
}

export interface WorkflowRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: RequestStatus;
  requester_name: string;
  manager_name?: string;
  department?: string;
  due_date?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  actor_name?: string;
  request_title?: string;
  created_at: string;
}

