import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import type { AuthedRequest, RequestStatus } from "../types.js";
import { canTransitionRequest, toAuditAction } from "../workflow.js";

const router = Router();

const createRequestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  requestType: z.string().min(2),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  managerId: z.string().uuid(),
  dueDate: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "needs_info"]),
  comment: z.string().min(2).optional()
});

router.use(authenticate);

router.get("/", async (req: AuthedRequest, res) => {
  const user = req.user!;
  const params: string[] = [];
  let filter = "";

  if (user.role === "employee") {
    params.push(user.id);
    filter = "WHERE requests.requester_id = $1";
  }

  if (user.role === "manager") {
    params.push(user.id);
    filter = "WHERE requests.manager_id = $1";
  }

  const { rows } = await pool.query(
    `SELECT requests.*, requester.name AS requester_name, manager.name AS manager_name
     FROM requests
     JOIN users requester ON requester.id = requests.requester_id
     JOIN users manager ON manager.id = requests.manager_id
     ${filter}
     ORDER BY requests.created_at DESC`,
    params
  );

  return res.json(rows);
});

router.post("/", requireRole(["employee", "admin"]), async (req: AuthedRequest, res) => {
  const parsed = createRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request payload", issues: parsed.error.issues });
  }

  const client = await pool.connect();
  const user = req.user!;

  try {
    await client.query("BEGIN");

    const requestResult = await client.query(
      `INSERT INTO requests (requester_id, manager_id, title, description, request_type, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user.id,
        parsed.data.managerId,
        parsed.data.title,
        parsed.data.description,
        parsed.data.requestType,
        parsed.data.priority,
        parsed.data.dueDate ?? null
      ]
    );

    const request = requestResult.rows[0];

    await client.query(
      `INSERT INTO approvals (request_id, approver_id)
       VALUES ($1, $2)`,
      [request.id, parsed.data.managerId]
    );

    await client.query(
      `INSERT INTO audit_logs (request_id, actor_id, action, new_status, metadata)
       VALUES ($1, $2, 'request.created', 'pending', $3)`,
      [request.id, user.id, { priority: parsed.data.priority, requestType: parsed.data.requestType }]
    );

    await client.query("COMMIT");
    return res.status(201).json(request);
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Failed to create request" });
  } finally {
    client.release();
  }
});

router.post("/:id/status", requireRole(["manager", "admin"]), async (req: AuthedRequest, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid status payload", issues: parsed.error.issues });
  }

  const client = await pool.connect();
  const user = req.user!;
  const nextStatus = parsed.data.status as RequestStatus;

  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      `SELECT * FROM requests WHERE id = $1 FOR UPDATE`,
      [req.params.id]
    );
    const existing = existingResult.rows[0];

    if (!existing) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Request not found" });
    }

    if (user.role === "manager" && existing.manager_id !== user.id) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Request is assigned to another manager" });
    }

    if (!canTransitionRequest(existing.status, nextStatus)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: `Cannot move request from ${existing.status} to ${nextStatus}` });
    }

    const updatedResult = await client.query(
      `UPDATE requests
       SET status = $1,
           updated_at = now(),
           completed_at = CASE WHEN $1 IN ('approved', 'rejected') THEN now() ELSE completed_at END
       WHERE id = $2
       RETURNING *`,
      [nextStatus, req.params.id]
    );

    await client.query(
      `UPDATE approvals
       SET status = $1, decided_at = now()
       WHERE request_id = $2 AND approver_id = $3`,
      [nextStatus, req.params.id, existing.manager_id]
    );

    if (parsed.data.comment) {
      await client.query(
        `INSERT INTO comments (request_id, author_id, body)
         VALUES ($1, $2, $3)`,
        [req.params.id, user.id, parsed.data.comment]
      );
    }

    await client.query(
      `INSERT INTO audit_logs (request_id, actor_id, action, previous_status, new_status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.params.id,
        user.id,
        toAuditAction(nextStatus),
        existing.status,
        nextStatus,
        { commentAdded: Boolean(parsed.data.comment) }
      ]
    );

    await client.query("COMMIT");
    return res.json(updatedResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Failed to update request status" });
  } finally {
    client.release();
  }
});

export default router;

