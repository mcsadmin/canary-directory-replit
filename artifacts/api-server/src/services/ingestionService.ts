/**
 * CSV Ingestion Pipeline Service (ADR-002, ADR-005, ADR-006, ADR-012, ADR-013, ADR-018, ADR-020)
 *
 * Processes a CSV invoice file for a given creditor:
 * 1. Parse CSV rows
 * 2. For each row, run entity resolution on the debtor
 * 3. Create invoices, nodes, review items as appropriate
 * 4. Log audit events
 * 5. Return ingestion summary
 *
 * All database writes are wrapped in a transaction for atomicity.
 */

import { parse } from "csv-parse/sync";
import { eq, and, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@workspace/db/schema";
import { normalise } from "../modules/nameNormaliser.js";
import { classify } from "../modules/geoClassifier.js";
import { assignCanonicalName } from "../modules/canonicalNameAssigner.js";
import { findExternalMatch, type DebtorDetails as ExternalDebtorDetails } from "../modules/externalDataModule.js";
import { findCandidates, UPPER_THRESHOLD, LOWER_THRESHOLD } from "../modules/matcher.js";

export interface CsvRow {
  creditor_name: string;
  debtor_name: string;
  amount_due: string;
  debtor_address?: string;
  debtor_email?: string;
  debtor_company_number?: string;
  debtor_vat_number?: string;
  debtor_postcode?: string;
  debtor_website?: string;
  debtor_phone?: string;
  debtor_contact_name?: string;
}

export interface IngestionResult {
  filename: string;
  total_rows: number;
  new_invoices: number;
  pending_invoices: number;
  new_nodes: number;
  new_review_items: number;
}

const SYSTEM_OPERATOR_ID = process.env["SYSTEM_OPERATOR_ID"];

/**
 * Main ingestion entry point. Parses and processes a CSV file for a creditor.
 */
export async function ingestCsvFile(
  csvBuffer: Buffer,
  filename: string,
  creditorNodeId: string,
  db: NodePgDatabase<typeof schema>,
): Promise<IngestionResult> {
  // Fetch and validate creditor node
  const [creditor] = await db
    .select()
    .from(schema.businessNodes)
    .where(eq(schema.businessNodes.nodeId, creditorNodeId))
    .limit(1);

  if (!creditor) {
    throw new Error(`Creditor node not found: ${creditorNodeId}`);
  }

  // Parse CSV
  const rows: CsvRow[] = parse(csvBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const summary = {
    filename,
    total_rows: rows.length,
    new_invoices: 0,
    pending_invoices: 0,
    new_nodes: 0,
    new_review_items: 0,
  };

  if (rows.length === 0) {
    return summary;
  }

  // Create ingestion batch record
  const [batch] = await db
    .insert(schema.ingestionBatches)
    .values({
      creditorNodeId,
      filename,
      totalRows: rows.length,
      newInvoices: 0,
      pendingInvoices: 0,
      newNodes: 0,
      newReviewItems: 0,
    })
    .returning();

  // Process rows in a transaction for atomicity
  await db.transaction(async (tx) => {
    for (const row of rows) {
      try {
        const rowSummary = await processRow(row, creditor, batch.batchId, tx);
        summary.new_invoices += rowSummary.new_invoices;
        summary.pending_invoices += rowSummary.pending_invoices;
        summary.new_nodes += rowSummary.new_nodes;
        summary.new_review_items += rowSummary.new_review_items;
      } catch (err) {
        // Re-throw so transaction rolls back
        throw err;
      }
    }
  });

  // Update batch summary
  await db
    .update(schema.ingestionBatches)
    .set({
      newInvoices: summary.new_invoices,
      pendingInvoices: summary.pending_invoices,
      newNodes: summary.new_nodes,
      newReviewItems: summary.new_review_items,
    })
    .where(eq(schema.ingestionBatches.batchId, batch.batchId));

  // Audit event for the batch
  await db.insert(schema.auditEvents).values({
    eventType: "INVOICE_BATCH_INGESTED",
    entityId: batch.batchId,
    entityType: "ingestion_batch",
    payload: {
      filename,
      creditorNodeId,
      creditorName: creditor.canonicalName,
      ...summary,
    },
    operatorId: SYSTEM_OPERATOR_ID ?? null,
  });

  return summary;
}

interface RowSummary {
  new_invoices: number;
  pending_invoices: number;
  new_nodes: number;
  new_review_items: number;
}

async function processRow(
  row: CsvRow,
  creditor: schema.BusinessNode,
  batchId: string,
  tx: NodePgDatabase<typeof schema>,
): Promise<RowSummary> {
  const summary: RowSummary = {
    new_invoices: 0,
    pending_invoices: 0,
    new_nodes: 0,
    new_review_items: 0,
  };

  const debtorName = row.debtor_name?.trim() ?? "";
  const normalisedDebtorName = normalise(debtorName);
  const amountDue = row.amount_due?.trim() ?? "0";
  const debtorCompanyNumber = row.debtor_company_number?.trim() || null;
  const debtorAddress = row.debtor_address?.trim() || null;
  const debtorPostcode = row.debtor_postcode?.trim() || null;

  // ADR-020: If creditor is unresolved, invoices go to pending
  if (creditor.verificationStatus === "unresolved") {
    // Find or create debtor node (still needed for reference)
    const debtorNode = await findOrCreateDebtor(
      { name: debtorName, normalisedName: normalisedDebtorName, companyNumber: debtorCompanyNumber },
      row,
      tx,
    );

    await tx.insert(schema.invoices).values({
      creditorNodeId: creditor.nodeId,
      debtorNodeId: debtorNode.nodeId,
      creditorName: row.creditor_name,
      debtorName,
      amountDue,
      status: "pending",
      debtorAddress,
      debtorEmail: row.debtor_email?.trim() || null,
      debtorCompanyNumber,
      debtorVatNumber: row.debtor_vat_number?.trim() || null,
      debtorPostcode,
      debtorWebsite: row.debtor_website?.trim() || null,
      debtorPhone: row.debtor_phone?.trim() || null,
      debtorContactName: row.debtor_contact_name?.trim() || null,
      batchId,
    });

    summary.pending_invoices += 1;
    return summary;
  }

  // ADR-021: Check company_number uniqueness FIRST
  if (debtorCompanyNumber) {
    const existingWithCrn = await tx
      .select()
      .from(schema.businessNodes)
      .where(
        and(
          eq(schema.businessNodes.companyNumber, debtorCompanyNumber),
          eq(schema.businessNodes.isArchived, false),
        ),
      )
      .limit(1);

    if (existingWithCrn.length > 0) {
      const conflictNode = existingWithCrn[0];
      // Check if it's the same node (high-confidence name match)
      const normalisedExisting = normalise(conflictNode.canonicalName);
      const nameMatch = normalisedDebtorName === normalisedExisting;

      if (!nameMatch) {
        // Data conflict: same CRN but different names — create review item, DO NOT create new node
        const [invoice] = await tx.insert(schema.invoices).values({
          creditorNodeId: creditor.nodeId,
          debtorNodeId: conflictNode.nodeId,
          creditorName: row.creditor_name,
          debtorName,
          amountDue,
          status: "active",
          debtorAddress,
          debtorEmail: row.debtor_email?.trim() || null,
          debtorCompanyNumber,
          debtorVatNumber: row.debtor_vat_number?.trim() || null,
          debtorPostcode,
          batchId,
        }).returning();

        await tx.insert(schema.operatorReviews).values({
          reviewType: "data_conflict",
          sourceInvoiceId: invoice.invoiceId,
          candidateNodeId: conflictNode.nodeId,
          newNodeId: conflictNode.nodeId,
          rawDebtorDetails: {
            debtor_name: debtorName,
            debtor_company_number: debtorCompanyNumber,
            conflict_with_node_id: conflictNode.nodeId,
            conflict_with_name: conflictNode.canonicalName,
          },
          confidenceScore: "100",
          status: "pending",
        });

        await tx.insert(schema.auditEvents).values({
          eventType: "DATA_CONFLICT_FLAGGED",
          entityId: conflictNode.nodeId,
          entityType: "business_node",
          payload: {
            debtorName,
            debtorCompanyNumber,
            existingNodeName: conflictNode.canonicalName,
          },
          operatorId: null,
        });

        summary.new_invoices += 1;
        summary.new_review_items += 1;
        return summary;
      }

      // Same name + same CRN = high confidence match to existing node
      const debtorNode = conflictNode;
      await ensureAlias(debtorName, debtorNode.nodeId, creditor.nodeId, tx);

      const [invoice] = await tx.insert(schema.invoices).values({
        creditorNodeId: creditor.nodeId,
        debtorNodeId: debtorNode.nodeId,
        creditorName: row.creditor_name,
        debtorName,
        amountDue,
        status: "active",
        debtorAddress,
        debtorCompanyNumber,
        batchId,
      }).returning();

      await handleContactCreation(row, debtorNode.nodeId, invoice.invoiceId, tx);
      await logMatchAudit(invoice.invoiceId, debtorName, [{ nodeId: debtorNode.nodeId, score: 100, tier: "high" }], "matched", tx);

      summary.new_invoices += 1;
      return summary;
    }
  }

  // Primary search: find candidates in internal directory
  const details: ExternalDebtorDetails = {
    name: debtorName,
    normalisedName: normalisedDebtorName,
    companyNumber: debtorCompanyNumber,
    address: debtorAddress,
    postcode: debtorPostcode,
  };

  const candidates = await findCandidates(
    { name: debtorName, normalisedName: normalisedDebtorName, companyNumber: debtorCompanyNumber },
    tx,
  );

  const bestCandidate = candidates.length > 0 ? candidates[0] : null;

  if (bestCandidate && bestCandidate.score >= UPPER_THRESHOLD) {
    // HIGH confidence: attach invoice to existing node
    const [existingNode] = await tx
      .select()
      .from(schema.businessNodes)
      .where(eq(schema.businessNodes.nodeId, bestCandidate.nodeId))
      .limit(1);

    await ensureAlias(debtorName, existingNode.nodeId, creditor.nodeId, tx);

    const [invoice] = await tx.insert(schema.invoices).values({
      creditorNodeId: creditor.nodeId,
      debtorNodeId: existingNode.nodeId,
      creditorName: row.creditor_name,
      debtorName,
      amountDue,
      status: "active",
      debtorAddress,
      debtorEmail: row.debtor_email?.trim() || null,
      debtorCompanyNumber,
      debtorVatNumber: row.debtor_vat_number?.trim() || null,
      debtorPostcode,
      debtorWebsite: row.debtor_website?.trim() || null,
      debtorPhone: row.debtor_phone?.trim() || null,
      debtorContactName: row.debtor_contact_name?.trim() || null,
      batchId,
    }).returning();

    await handleContactCreation(row, existingNode.nodeId, invoice.invoiceId, tx);
    await logMatchAudit(invoice.invoiceId, debtorName, candidates.slice(0, 5), "matched", tx);

    summary.new_invoices += 1;
    return summary;
  }

  if (bestCandidate && bestCandidate.score >= LOWER_THRESHOLD) {
    // MEDIUM confidence: create new node, create review queue item
    const geoStatus = classify(debtorAddress, debtorPostcode);
    const [newNode] = await tx
      .insert(schema.businessNodes)
      .values({
        canonicalName: assignCanonicalName([debtorName]),
        participationStatus: "third_party",
        verificationStatus: "unresolved",
        geographicalStatus: geoStatus,
        companyNumber: debtorCompanyNumber,
      })
      .returning();

    await ensureAlias(debtorName, newNode.nodeId, creditor.nodeId, tx);

    const [invoice] = await tx.insert(schema.invoices).values({
      creditorNodeId: creditor.nodeId,
      debtorNodeId: newNode.nodeId,
      creditorName: row.creditor_name,
      debtorName,
      amountDue,
      status: "active",
      debtorAddress,
      debtorEmail: row.debtor_email?.trim() || null,
      debtorCompanyNumber,
      debtorVatNumber: row.debtor_vat_number?.trim() || null,
      debtorPostcode,
      debtorWebsite: row.debtor_website?.trim() || null,
      debtorPhone: row.debtor_phone?.trim() || null,
      debtorContactName: row.debtor_contact_name?.trim() || null,
      batchId,
    }).returning();

    await tx.insert(schema.operatorReviews).values({
      reviewType: "proposed_match",
      sourceInvoiceId: invoice.invoiceId,
      candidateNodeId: bestCandidate.nodeId,
      newNodeId: newNode.nodeId,
      rawDebtorDetails: { debtor_name: debtorName, debtor_address: debtorAddress },
      confidenceScore: String(bestCandidate.score),
      status: "pending",
    });

    await logMatchAudit(invoice.invoiceId, debtorName, candidates.slice(0, 5), "review_queued", tx);

    summary.new_invoices += 1;
    summary.new_nodes += 1;
    summary.new_review_items += 1;
    return summary;
  }

  // LOW confidence: create new node, attempt secondary search
  // Secondary search (ADR-005): only if no high-confidence match in primary
  const externalMatch = await findExternalMatch(details, tx);

  const geoStatus = externalMatch
    ? classify(externalMatch.address, externalMatch.postcode)
    : classify(debtorAddress, debtorPostcode);

  const verificationStatus = externalMatch ? "resolved" : "unresolved";

  const [newNode] = await tx
    .insert(schema.businessNodes)
    .values({
      canonicalName: assignCanonicalName([externalMatch?.name ?? debtorName]),
      participationStatus: "third_party",
      verificationStatus,
      geographicalStatus: geoStatus,
      companyNumber: debtorCompanyNumber ?? (externalMatch?.crn ?? null),
    })
    .returning();

  await ensureAlias(debtorName, newNode.nodeId, creditor.nodeId, tx);

  const [invoice] = await tx.insert(schema.invoices).values({
    creditorNodeId: creditor.nodeId,
    debtorNodeId: newNode.nodeId,
    creditorName: row.creditor_name,
    debtorName,
    amountDue,
    status: "active",
    debtorAddress,
    debtorEmail: row.debtor_email?.trim() || null,
    debtorCompanyNumber,
    debtorVatNumber: row.debtor_vat_number?.trim() || null,
    debtorPostcode,
    debtorWebsite: row.debtor_website?.trim() || null,
    debtorPhone: row.debtor_phone?.trim() || null,
    debtorContactName: row.debtor_contact_name?.trim() || null,
    batchId,
  }).returning();

  await handleContactCreation(row, newNode.nodeId, invoice.invoiceId, tx);
  await logMatchAudit(invoice.invoiceId, debtorName, candidates.slice(0, 5), externalMatch ? "matched_external" : "new_node_created", tx);

  await tx.insert(schema.auditEvents).values({
    eventType: externalMatch ? "NODE_CREATED_FROM_EXTERNAL" : "NODE_CREATED",
    entityId: newNode.nodeId,
    entityType: "business_node",
    payload: {
      canonicalName: newNode.canonicalName,
      debtorName,
      verificationStatus,
      geoStatus,
      sourceInvoiceId: invoice.invoiceId,
      fromExternalDataset: !!externalMatch,
    },
    operatorId: null,
  });

  summary.new_invoices += 1;
  summary.new_nodes += 1;
  return summary;
}

/** Ensures an invoice alias exists for a debtor name from a creditor, no-op if already exists */
async function ensureAlias(
  aliasText: string,
  businessNodeId: string,
  creditorNodeId: string,
  tx: NodePgDatabase<typeof schema>,
): Promise<void> {
  await tx
    .insert(schema.invoiceAliases)
    .values({ aliasText, businessNodeId, creditorNodeId })
    .onConflictDoNothing();
}

/** Find or create a debtor node (used for pending invoices). Simplified - just creates new node */
async function findOrCreateDebtor(
  details: { name: string; normalisedName: string; companyNumber: string | null },
  row: CsvRow,
  tx: NodePgDatabase<typeof schema>,
): Promise<schema.BusinessNode> {
  // For pending invoices, we still need a debtor node; just create it simply
  const geoStatus = classify(row.debtor_address, row.debtor_postcode);
  const [node] = await tx
    .insert(schema.businessNodes)
    .values({
      canonicalName: details.name,
      participationStatus: "third_party",
      verificationStatus: "unresolved",
      geographicalStatus: geoStatus,
      companyNumber: details.companyNumber,
    })
    .returning();
  return node;
}

/** Creates a contact entity if debtor_contact_name is present (ADR-011) */
async function handleContactCreation(
  row: CsvRow,
  businessNodeId: string,
  invoiceId: string,
  tx: NodePgDatabase<typeof schema>,
): Promise<void> {
  const contactName = row.debtor_contact_name?.trim();
  if (!contactName) return;

  const [contact] = await tx
    .insert(schema.contacts)
    .values({
      name: contactName,
      linkedBusinessNodeId: businessNodeId,
      role: "contact",
    })
    .returning();

  await tx.insert(schema.auditEvents).values({
    eventType: "CONTACT_CREATED",
    entityId: contact.contactId,
    entityType: "contact",
    payload: {
      contactName,
      linkedBusinessNodeId: businessNodeId,
      sourceInvoiceId: invoiceId,
    },
    operatorId: null,
  });
}

/** Logs a match attempt audit event (ADR-012) */
async function logMatchAudit(
  invoiceId: string,
  debtorName: string,
  candidates: Array<{ nodeId: string; score: number; tier: string }>,
  outcome: string,
  tx: NodePgDatabase<typeof schema>,
): Promise<void> {
  await tx.insert(schema.auditEvents).values({
    eventType: "ENTITY_RESOLUTION_ATTEMPTED",
    entityId: invoiceId,
    entityType: "invoice",
    payload: {
      debtorName,
      candidates: candidates.map((c) => ({
        nodeId: c.nodeId,
        score: c.score,
        tier: c.tier,
      })),
      outcome,
    },
    operatorId: null,
  });
}
