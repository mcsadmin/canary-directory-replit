/**
 * Operator Review Queue routes (ADR-027, ADR-028)
 * GET  /api/v1/review-queue
 * GET  /api/v1/review-queue/:reviewId
 * POST /api/v1/review-queue/:reviewId/accept
 * POST /api/v1/review-queue/:reviewId/reject
 * POST /api/v1/review-queue/:reviewId/skip
 */

import { Router } from "express";
import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { eq, and, or } from "drizzle-orm";

const router = Router();

const SYSTEM_OPERATOR_ID = process.env["SYSTEM_OPERATOR_ID"];

router.get("/", async (_req, res) => {
  try {
    const items = await db
      .select({
        reviewId: schema.operatorReviews.reviewId,
        reviewType: schema.operatorReviews.reviewType,
        status: schema.operatorReviews.status,
        confidenceScore: schema.operatorReviews.confidenceScore,
        sourceInvoiceId: schema.operatorReviews.sourceInvoiceId,
        createdAt: schema.operatorReviews.createdAt,
        newNodeId: schema.operatorReviews.newNodeId,
        candidateNodeId: schema.operatorReviews.candidateNodeId,
      })
      .from(schema.operatorReviews)
      .where(eq(schema.operatorReviews.status, "pending"))
      .orderBy(schema.operatorReviews.createdAt);

    const nodeIds = new Set<string>();
    for (const item of items) {
      nodeIds.add(item.newNodeId);
      if (item.candidateNodeId) nodeIds.add(item.candidateNodeId);
    }

    const nodes = nodeIds.size > 0
      ? await db
          .select({ nodeId: schema.businessNodes.nodeId, canonicalName: schema.businessNodes.canonicalName })
          .from(schema.businessNodes)
          .where(or(...[...nodeIds].map((id) => eq(schema.businessNodes.nodeId, id))))
      : [];

    const nodeMap = new Map(nodes.map((n) => [n.nodeId, n.canonicalName]));

    res.json({
      items: items.map((item) => ({
        review_id: item.reviewId,
        review_type: item.reviewType,
        status: item.status,
        new_node_canonical_name: nodeMap.get(item.newNodeId) ?? "Unknown",
        candidate_node_canonical_name: item.candidateNodeId ? (nodeMap.get(item.candidateNodeId) ?? null) : null,
        confidence_score: item.confidenceScore ? Number(item.confidenceScore) : null,
        source_invoice_id: item.sourceInvoiceId,
        created_at: item.createdAt.toISOString(),
      })),
      pending_count: items.length,
    });
  } catch (err) {
    console.error("GET /review-queue error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:reviewId", async (req, res) => {
  try {
    const [review] = await db
      .select()
      .from(schema.operatorReviews)
      .where(eq(schema.operatorReviews.reviewId, req.params.reviewId))
      .limit(1);

    if (!review) {
      return res.status(404).json({ error: "Not found", message: "Review item not found" });
    }

    const [newNode] = await db
      .select()
      .from(schema.businessNodes)
      .where(eq(schema.businessNodes.nodeId, review.newNodeId))
      .limit(1);

    let candidateNode = null;
    if (review.candidateNodeId) {
      const [cn] = await db
        .select()
        .from(schema.businessNodes)
        .where(eq(schema.businessNodes.nodeId, review.candidateNodeId))
        .limit(1);
      candidateNode = cn ?? null;
    }

    const formatNode = (n: schema.BusinessNode) => ({
      node_id: n.nodeId,
      canonical_name: n.canonicalName,
      participation_status: n.participationStatus,
      verification_status: n.verificationStatus,
      geographical_status: n.geographicalStatus,
      company_number: n.companyNumber,
      created_at: n.createdAt.toISOString(),
      updated_at: n.updatedAt.toISOString(),
    });

    res.json({
      review_id: review.reviewId,
      review_type: review.reviewType,
      status: review.status,
      confidence_score: review.confidenceScore ? Number(review.confidenceScore) : null,
      raw_debtor_details: review.rawDebtorDetails ?? {},
      new_node: formatNode(newNode),
      candidate_node: candidateNode ? formatNode(candidateNode) : null,
      source_invoice_id: review.sourceInvoiceId,
      created_at: review.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("GET /review-queue/:id error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/:reviewId/accept", async (req, res) => {
  try {
    const [review] = await db
      .select()
      .from(schema.operatorReviews)
      .where(eq(schema.operatorReviews.reviewId, req.params.reviewId))
      .limit(1);

    if (!review) {
      return res.status(404).json({ error: "Not found", message: "Review item not found" });
    }
    if (review.status !== "pending") {
      return res.status(409).json({ error: "Conflict", message: "Review item is not pending" });
    }
    if (!review.candidateNodeId) {
      return res.status(400).json({ error: "Bad request", message: "No candidate node to merge into" });
    }

    await db.transaction(async (tx) => {
      // Transfer all invoices from new node → candidate node
      await tx
        .update(schema.invoices)
        .set({ debtorNodeId: review.candidateNodeId! })
        .where(eq(schema.invoices.debtorNodeId, review.newNodeId));

      await tx
        .update(schema.invoices)
        .set({ creditorNodeId: review.candidateNodeId! })
        .where(eq(schema.invoices.creditorNodeId, review.newNodeId));

      // Transfer invoice aliases
      await tx
        .update(schema.invoiceAliases)
        .set({ businessNodeId: review.candidateNodeId! })
        .where(eq(schema.invoiceAliases.businessNodeId, review.newNodeId));

      // Archive the new node
      await tx
        .update(schema.businessNodes)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(eq(schema.businessNodes.nodeId, review.newNodeId));

      // Close review item
      await tx
        .update(schema.operatorReviews)
        .set({ status: "accepted", operatorId: SYSTEM_OPERATOR_ID ?? null, decisionTimestamp: new Date() })
        .where(eq(schema.operatorReviews.reviewId, review.reviewId));

      // Audit event
      await tx.insert(schema.auditEvents).values({
        eventType: "NODE_MERGED",
        entityId: review.candidateNodeId,
        entityType: "business_node",
        payload: {
          mergedNodeId: review.newNodeId,
          targetNodeId: review.candidateNodeId,
          reviewId: review.reviewId,
        },
        operatorId: SYSTEM_OPERATOR_ID ?? null,
      });
    });

    res.json({
      review_id: review.reviewId,
      action: "accepted",
      message: "Nodes merged successfully",
    });
  } catch (err) {
    console.error("POST /review-queue/:id/accept error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/:reviewId/reject", async (req, res) => {
  try {
    const [review] = await db
      .select()
      .from(schema.operatorReviews)
      .where(eq(schema.operatorReviews.reviewId, req.params.reviewId))
      .limit(1);

    if (!review) {
      return res.status(404).json({ error: "Not found", message: "Review item not found" });
    }
    if (review.status !== "pending") {
      return res.status(409).json({ error: "Conflict", message: "Review item is not pending" });
    }
    if (!review.candidateNodeId) {
      return res.status(409).json({ error: "Conflict", message: "No candidate node to create rule against" });
    }

    await db.transaction(async (tx) => {
      // Create do_not_match rule (ADR-028)
      await tx.insert(schema.matchRules).values({
        nodeIdA: review.newNodeId,
        nodeIdB: review.candidateNodeId!,
        ruleType: "do_not_match",
        createdBy: SYSTEM_OPERATOR_ID ?? null,
      }).onConflictDoNothing();

      // Close review item
      await tx
        .update(schema.operatorReviews)
        .set({ status: "rejected", operatorId: SYSTEM_OPERATOR_ID ?? null, decisionTimestamp: new Date() })
        .where(eq(schema.operatorReviews.reviewId, review.reviewId));

      // Audit event
      await tx.insert(schema.auditEvents).values({
        eventType: "MATCH_REJECTED",
        entityId: review.reviewId,
        entityType: "operator_review",
        payload: {
          newNodeId: review.newNodeId,
          candidateNodeId: review.candidateNodeId,
          ruleCreated: "do_not_match",
        },
        operatorId: SYSTEM_OPERATOR_ID ?? null,
      });
    });

    res.json({
      review_id: review.reviewId,
      action: "rejected",
      message: "Match rejected. do_not_match rule created.",
    });
  } catch (err) {
    console.error("POST /review-queue/:id/reject error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/:reviewId/skip", async (req, res) => {
  try {
    const [review] = await db
      .select()
      .from(schema.operatorReviews)
      .where(eq(schema.operatorReviews.reviewId, req.params.reviewId))
      .limit(1);

    if (!review) {
      return res.status(404).json({ error: "Not found", message: "Review item not found" });
    }

    res.json({
      review_id: review.reviewId,
      action: "skipped",
      message: "Review item remains pending",
    });
  } catch (err) {
    console.error("POST /review-queue/:id/skip error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
