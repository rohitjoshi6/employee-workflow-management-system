import { Router } from "express";
import { pool } from "../db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole(["admin"]));

router.get("/audit-logs", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT audit_logs.*, actor.name AS actor_name, requests.title AS request_title
     FROM audit_logs
     LEFT JOIN users actor ON actor.id = audit_logs.actor_id
     LEFT JOIN requests ON requests.id = audit_logs.request_id
     ORDER BY audit_logs.created_at DESC
     LIMIT 100`
  );

  return res.json(rows);
});

router.get("/metrics", async (_req, res) => {
  const statusResult = await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM requests
     GROUP BY status
     ORDER BY status`
  );

  const summaryResult = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
       COUNT(*) FILTER (WHERE status IN ('approved', 'rejected'))::int AS completed_count,
       COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) FILTER (WHERE completed_at IS NOT NULL), 1), 0)::float AS average_approval_hours
     FROM requests`
  );

  return res.json({
    byStatus: statusResult.rows,
    ...summaryResult.rows[0]
  });
});

export default router;

