# CANARY-03: CSV Ingestion Pipeline

- **Status:** Not Started
- **Depends On:** CANARY-01, CANARY-02
- **Requirements:** ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, ADR-010, ADR-012, ADR-013, ADR-016, ADR-018, ADR-020

---

## Implementation Plan

Create `artifacts/api-server/src/services/ingestionService.ts`:

1. Parse CSV using `csv-parse` — handles 3 mandatory fields + optional fields from ADR-010
2. For each row:
   a. Check creditor verification_status → if unresolved, create pending invoice, skip
   b. Normalise debtor name via nameNormaliser
   c. Run primary search (findCandidates) → apply threshold logic
   d. HIGH confidence → attach invoice to existing node; add alias if new
   e. MEDIUM confidence → create new unresolved node, create review queue item
   f. LOW confidence → create new unresolved node; run secondary search (externalDataModule); if found → set resolved + enrich; else unresolved
   g. Check company_number uniqueness constraint (ADR-021) — if conflict, create data_conflict review item, do NOT create node
   h. Classify geo (geoClassifier)
   i. Log audit event
3. Entire ingestion wrapped in a transaction — rollback on error
4. Return IngestionSummary: { totalRows, newInvoices, pendingInvoices, newNodes, newReviewItems }

## Acceptance Criteria

- Single CSV file → correct invoice and node creation
- Transaction atomicity: partial failure rolls back entire batch
- Pending invoices created for unresolved creditors
- Review queue items created for medium-confidence matches
- Company number conflict → no new node, review item created
- Audit log entry per invoice processed
