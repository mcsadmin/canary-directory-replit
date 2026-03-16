/**
 * Activity Feed route (ADR-029, ADR-035)
 * GET /api/v1/activity
 */

import { Router } from "express";
import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);

    const events = await db
      .select()
      .from(schema.auditEvents)
      .orderBy(desc(schema.auditEvents.createdAt))
      .limit(limit);

    res.json({
      events: events.map((e) => ({
        event_id: e.eventId,
        event_type: e.eventType,
        entity_id: e.entityId,
        entity_type: e.entityType,
        payload: e.payload,
        operator_id: e.operatorId,
        created_at: e.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("GET /activity error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
