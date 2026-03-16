# Local Loop Directory Canary

## Overview
A full-stack operator tool for managing a local business directory graph built from invoice CSV data. Operators can ingest invoice CSVs, which triggers entity resolution, and manage the resulting directory via a review queue and audit trail.

## Architecture

### Monorepo Structure (pnpm workspaces)
```
lib/
  db/           - @workspace/db — Drizzle ORM schema + PostgreSQL client
  api-spec/     - @workspace/api-spec — OpenAPI spec (openapi.yaml)
  api-zod/      - @workspace/api-zod — Zod schemas generated from OpenAPI
  api-client-react/ - @workspace/api-client-react — React hooks generated from OpenAPI
artifacts/
  api-server/   - @workspace/api-server — Express.js REST API (port 8080)
  operator-ui/  - @workspace/operator-ui — React + Vite operator dashboard (port varies)
  mockup-sandbox/ - Vite mockup preview server
scripts/
  src/seed.ts   - Database seed script (operator account + external_data records)
planning/
  tickets/      - CANARY-01 through CANARY-06 planning tickets
  ADRs/         - Architecture Decision Records (40 ADRs)
  scenarios/    - Gherkin BDD scenarios (64 scenarios)
```

### Technology Stack
- **Backend**: Node.js + Express + TypeScript (ESM)
- **Database**: PostgreSQL via Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Code generation**: OpenAPI → Zod schemas + React hooks (orval)

## Database Schema (10 tables)

| Table | Purpose |
|-------|---------|
| business_nodes | Core entity — all businesses (creditors + debtors) |
| invoices | Invoice records linking creditor→debtor |
| invoice_aliases | Name variations per business from each creditor |
| contacts | Contact persons linked to business nodes |
| operators | Operator accounts (single account in canary) |
| operator_reviews | Review queue items (proposed_match, data_conflict) |
| audit_events | Immutable audit trail |
| match_rules | do_not_match rules between node pairs |
| ingestion_batches | CSV ingestion run summaries |
| external_data | External company dataset for secondary enrichment |

### Key Enums
- **participation_status**: `platform_user` | `third_party`
- **verification_status**: `resolved` | `unresolved`
- **geographical_status**: `local` | `remote` | `uncertain`
- **review_type**: `proposed_match` | `data_conflict` | `contact_classification`
- **review_status**: `pending` | `accepted` | `rejected`
- **invoice_status**: `active` | `pending`

## API Endpoints

All endpoints under `/api/v1/`:

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/healthz | Health check |
| GET | /api/v1/directory | List business nodes with filters/sorting |
| GET | /api/v1/creditors | List platform_user creditors |
| POST | /api/v1/creditors | Register new creditor |
| POST | /api/v1/ingest | Upload CSV file for ingestion |
| GET | /api/v1/review-queue | List pending review items |
| GET | /api/v1/review-queue/:id | Get review item detail |
| POST | /api/v1/review-queue/:id/accept | Accept match (merge nodes) |
| POST | /api/v1/review-queue/:id/reject | Reject match (create do_not_match rule) |
| POST | /api/v1/review-queue/:id/skip | Skip (leave pending) |
| GET | /api/v1/activity | Get audit event feed |

## Entity Resolution Pipeline

The ingestion pipeline (`artifacts/api-server/src/services/ingestionService.ts`) processes each CSV row:

1. **CRN uniqueness check**: If company_number already exists internally and name differs → data_conflict review item
2. **Primary search**: Levenshtein distance scoring against all internal nodes
   - HIGH ≥ 80: Auto-attach to existing node
   - MEDIUM ≥ 15: Create new node + proposed_match review item
   - LOW < 15: Proceed to secondary search
3. **Secondary search**: CRN lookup against `external_data` table → if found, creates resolved node
4. **No match**: Creates unresolved node

### Key Modules
- `nameNormaliser.ts` — Strips legal suffixes, normalises to lowercase
- `geoClassifier.ts` — Classifies postcode against WA7 catchment (configurable via `CATCHMENT_POSTCODE_PREFIX`)
- `matcher.ts` — Levenshtein distance scoring with configurable thresholds
- `externalDataModule.ts` — CRN lookup against external_data table
- `canonicalNameAssigner.ts` — First-name-wins strategy

## Frontend Pages

| Route | Page |
|-------|------|
| / | Business Directory — table with filters and sorting |
| /upload | Upload Invoices — creditor selector + CSV file drop |
| /review-queue | Review Queue — list of pending items |
| /review-queue/:id | Review Detail — side-by-side node comparison + accept/reject/skip |
| /creditors/new | Register Creditor — simple form |
| /activity | Audit Trail — chronological event log |

## Configuration

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (provisioned by Replit)
- `CATCHMENT_POSTCODE_PREFIX` — Default: `WA7` (Runcorn/Halton area)
- `MATCH_UPPER_THRESHOLD` — Default: `80` (HIGH confidence threshold)
- `MATCH_LOWER_THRESHOLD` — Default: `15` (MEDIUM confidence threshold)
- `SYSTEM_OPERATOR_ID` — Optional operator UUID for audit events

## Seeding

Run the seed script to populate initial data:
```bash
pnpm --filter @workspace/scripts run seed
```

Seeds:
- 1 operator account (username: `operator`)
- 4 external_data records: Mk Mart Ltd (CRN: 15383077), Devine Cosmetics Consultancy (CRN: 12162272), Drive Development Solutions (CRN: 08395882), Riverside Garage Ltd (CRN: 87654321)

## Key Decisions (selected ADRs)

- **ADR-013**: Levenshtein distance for name matching (canary implementation)
- **ADR-014**: WA7 postcode prefix for local catchment classification
- **ADR-017**: Legal suffix stripping in name normalisation
- **ADR-019**: External data stored in PostgreSQL table
- **ADR-020**: Invoices from unresolved creditors → pending status
- **ADR-021**: company_number uniqueness enforced — conflict creates data_conflict review
- **ADR-028**: Rejected match creates do_not_match rule
- **ADR-031**: Single hard-coded operator, no login UI required for canary

## User Preferences
- Riverside Garage Ltd row was manually added to the seed script (missing from original external_dataset.csv) per operator agreement.
