/**
 * Creditor registration routes (ADR-031)
 * GET  /api/v1/creditors — list platform users
 * POST /api/v1/creditors — register a new creditor
 */

import { Router } from "express";
import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const creditors = await db
      .select({
        nodeId: schema.businessNodes.nodeId,
        canonicalName: schema.businessNodes.canonicalName,
      })
      .from(schema.businessNodes)
      .where(
        and(
          eq(schema.businessNodes.participationStatus, "platform_user"),
          eq(schema.businessNodes.isArchived, false),
        ),
      )
      .orderBy(schema.businessNodes.canonicalName);

    res.json({
      creditors: creditors.map((c) => ({
        node_id: c.nodeId,
        canonical_name: c.canonicalName,
      })),
    });
  } catch (err) {
    console.error("GET /creditors error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { canonical_name } = req.body;

    if (!canonical_name || typeof canonical_name !== "string" || canonical_name.trim() === "") {
      return res.status(400).json({ error: "Bad request", message: "canonical_name is required" });
    }

    const name = canonical_name.trim();

    const [node] = await db
      .insert(schema.businessNodes)
      .values({
        canonicalName: name,
        participationStatus: "platform_user",
        verificationStatus: "resolved",
        geographicalStatus: "uncertain",
      })
      .returning();

    await db.insert(schema.auditEvents).values({
      eventType: "CREDITOR_REGISTERED",
      entityId: node.nodeId,
      entityType: "business_node",
      payload: { canonicalName: name },
      operatorId: null,
    });

    res.status(201).json({
      node_id: node.nodeId,
      canonical_name: node.canonicalName,
      participation_status: node.participationStatus,
      verification_status: node.verificationStatus,
      geographical_status: node.geographicalStatus,
      company_number: node.companyNumber,
      created_at: node.createdAt.toISOString(),
      updated_at: node.updatedAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Conflict", message: "A business node with this name already exists", code: "DUPLICATE" });
    }
    console.error("POST /creditors error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
