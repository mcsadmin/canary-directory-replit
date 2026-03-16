# CANARY-04: API Routes

- **Status:** Not Started
- **Depends On:** CANARY-01, CANARY-02, CANARY-03
- **Requirements:** ADR-025, ADR-026, ADR-027, ADR-028, ADR-031, ADR-035, ADR-039

---

## Implementation Plan

All routes under `/api/v1/` in `artifacts/api-server/src/routes/v1/`:

1. **`POST /api/v1/ingest`** — multipart upload, creditor_id param, runs ingestion pipeline, returns IngestionSummary
2. **`GET /api/v1/directory`** — returns business nodes with derived fields (last_seen_date, invoice_count, alias_count). Supports filter params: participation_status, verification_status, geographical_status. Sort: canonical_name, last_seen_date (default desc), invoice_count
3. **`GET /api/v1/review-queue`** — returns pending review items
4. **`GET /api/v1/review-queue/:id`** — returns single review item with both nodes' full details
5. **`POST /api/v1/review-queue/:id/accept`** — merges new node into candidate, creates audit event, closes review item
6. **`POST /api/v1/review-queue/:id/reject`** — creates do_not_match rule, creates audit event, closes review item
7. **`POST /api/v1/review-queue/:id/skip`** — no-op, item stays pending
8. **`POST /api/v1/creditors`** — creates new platform_user/resolved business node (creditor registration)
9. **`GET /api/v1/creditors`** — returns all platform_user nodes (for upload dropdown)
10. **`GET /api/v1/activity`** — returns audit events, newest first, for activity feed
11. **`GET /api/v1/healthz`** — health check

## Acceptance Criteria

- All endpoints return JSON with consistent error format (ADR-040)
- Node merge is transactional (transfers invoices, aliases; archives old node)
- do_not_match rule creation is atomic with review item rejection
- All mutations create audit events
