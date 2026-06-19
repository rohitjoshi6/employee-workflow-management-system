import type { Request } from "express";

export type RoleName = "employee" | "manager" | "admin";
export type RequestStatus = "pending" | "approved" | "rejected" | "needs_info";
export type RequestPriority = "low" | "medium" | "high" | "urgent";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: RoleName;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

