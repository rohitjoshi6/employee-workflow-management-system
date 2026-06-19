import type { NextFunction, Response } from "express";
import { pool } from "../db.js";
import type { AuthedRequest, RoleName } from "../types.js";

export async function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const userId = req.header("x-user-id");

  if (!userId) {
    return res.status(401).json({ message: "Missing x-user-id header" });
  }

  const { rows } = await pool.query(
    `SELECT users.id, users.name, users.email, users.department, roles.name AS role
     FROM users
     JOIN roles ON roles.id = users.role_id
     WHERE users.id = $1`,
    [userId]
  );

  if (!rows[0]) {
    return res.status(401).json({ message: "Unknown user" });
  }

  req.user = rows[0];
  return next();
}

export function requireRole(roles: RoleName[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

