import { Router } from "express";
import { pool } from "../db.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";

const router = Router();

router.use(authenticate, requireRole(["manager", "admin"]));

router.get("/queue", async (req: AuthedRequest, res) => {
  const user = req.user!;
  const params: string[] = [];
  let managerFilter = "";

  if (user.role === "manager") {
    params.push(user.id);
    managerFilter = "AND approvals.approver_id = $1";
  }

  const { rows } = await pool.query(
    `SELECT requests.*, requester.name AS requester_name, requester.department, approvals.id AS approval_id
     FROM approvals
     JOIN requests ON requests.id = approvals.request_id
     JOIN users requester ON requester.id = requests.requester_id
     WHERE approvals.status = 'pending' ${managerFilter}
     ORDER BY requests.priority DESC, requests.created_at ASC`,
    params
  );

  return res.json(rows);
});

export default router;

