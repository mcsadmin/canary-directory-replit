/**
 * Directory routes (ADR-025)
 * GET /api/v1/directory — list business nodes with filtering/sorting
 */

import { Router } from "express";
import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { eq, and, desc, asc, sql, count, max, isNull, or } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { participation_status, verification_status, geographical_status, sort_by, sort_order } = req.query;

    const conditions = [eq(schema.businessNodes.isArchived, false)];

    if (participation_status && ["platform_user", "third_party"].includes(participation_status as string)) {
      conditions.push(eq(schema.businessNodes.participationStatus, participation_status as "platform_user" | "third_party"));
    }
    if (verification_status && ["unresolved", "resolved"].includes(verification_status as string)) {
      conditions.push(eq(schema.businessNodes.verificationStatus, verification_status as "unresolved" | "resolved"));
    }
    if (geographical_status && ["local", "remote", "uncertain"].includes(geographical_status as string)) {
      conditions.push(eq(schema.businessNodes.geographicalStatus, geographical_status as "local" | "remote" | "uncertain"));
    }

    const validSortBy = ["canonical_name", "last_seen_date", "invoice_count"].includes(sort_by as string)
      ? (sort_by as string)
      : "last_seen_date";
    const validSortOrder = sort_order === "asc" ? "asc" : "desc";

    const nodes = await db
      .select({
        nodeId: schema.businessNodes.nodeId,
        canonicalName: schema.businessNodes.canonicalName,
        participationStatus: schema.businessNodes.participationStatus,
        verificationStatus: schema.businessNodes.verificationStatus,
        geographicalStatus: schema.businessNodes.geographicalStatus,
        companyNumber: schema.businessNodes.companyNumber,
        createdAt: schema.businessNodes.createdAt,
        invoiceCount: count(schema.invoices.invoiceId),
        lastSeenDate: max(schema.invoices.ingestedAt),
        invoiceAliasCount: sql<number>`(
          SELECT COUNT(*)::int FROM invoice_aliases ia
          WHERE ia.business_node_id = ${schema.businessNodes.nodeId}
        )`,
      })
      .from(schema.businessNodes)
      .leftJoin(
        schema.invoices,
        or(
          eq(schema.invoices.debtorNodeId, schema.businessNodes.nodeId),
          eq(schema.invoices.creditorNodeId, schema.businessNodes.nodeId),
        ),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(schema.businessNodes.nodeId)
      .orderBy(
        validSortOrder === "asc"
          ? asc(
              validSortBy === "canonical_name"
                ? schema.businessNodes.canonicalName
                : validSortBy === "invoice_count"
                  ? count(schema.invoices.invoiceId)
                  : max(schema.invoices.ingestedAt),
            )
          : desc(
              validSortBy === "canonical_name"
                ? schema.businessNodes.canonicalName
                : validSortBy === "invoice_count"
                  ? count(schema.invoices.invoiceId)
                  : max(schema.invoices.ingestedAt),
            ),
      );

    res.json({
      nodes: nodes.map((n) => ({
        node_id: n.nodeId,
        canonical_name: n.canonicalName,
        participation_status: n.participationStatus,
        verification_status: n.verificationStatus,
        geographical_status: n.geographicalStatus,
        company_number: n.companyNumber,
        invoice_alias_count: Number(n.invoiceAliasCount),
        invoice_count: Number(n.invoiceCount),
        last_seen_date: n.lastSeenDate?.toISOString() ?? null,
        created_at: n.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("GET /directory error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
