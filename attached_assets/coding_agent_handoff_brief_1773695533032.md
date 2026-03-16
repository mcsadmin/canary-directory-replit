# Coding Agent Handoff Brief — Canary Build

**Prepared by:** Coaching Agent
**Date:** 16 March 2026
**Status:** approved

---

## 1. What You Are Building

You are building the **canary** — a scoped, deployable build of the Local Loop Directory / entity resolution component. The canary builds an **invoice graph**: businesses as nodes, invoices as edges. It deploys on Railway.

### The Canary's Purpose

The canary provides confidence to Local Loop operators that — on the basis of realistic ingested invoice data — an accurate, reliable, and robust directory of businesses/nodes is being built, and will be updated/maintained on the basis of future invoice data with minimal human input.

### What "Done" Looks Like

When deployed, an operator can:
1. See the business directory as a data table.
2. Input arbitrary but valid sets of invoice data (CSV upload).
3. Verify with minimal effort that all expected behaviour has occurred, and no unexpected behaviour has occurred.

---

## 2. What to Read Before Writing Any Code

Documents referred to are delivered in a zip file.

### The Hierarchy of Authority

If you find a contradiction between documents, the order of precedence is as follows:

1.  **Requirements Artefacts are supreme.** The Gherkin feature files and Architectural Decision Records (ADRs) in `/specs/` are the single source of truth for what the system must do. No other document can override them.
2.  **This Handoff Brief is the primary build instruction.** It interprets the requirements and provides a concrete plan for the build. Where this document summarises a requirement, it is for convenience; the full requirement in the spec file always governs.
3.  **The Coding Agent Rules govern your working process.** The rules document at `/planning/coding_agent_rules.md` defines the standards and protocols you must follow. It cannot override this handoff brief or the requirements.

If you perceive a conflict, stop and flag it in a commit message.

### Reading Order

1.  **First, read the Coding Agent Rules** at `/planning/coding_agent_rules.md`. That document defines *how* you must work.
2.  **Second, read this Handoff Brief** in full. This document defines *what* you must build.
3.  **Third, read the detailed specifications** in this order:

### Priority 1 — Data Model and Ingestion
- `/specs/features/invoice_ingestion.feature` — 6 scenarios
- `/specs/adrs/ADR-001_invoice_data_structure.md` through `ADR-004_single_creditor_per_file.md`
- `/specs/data_dictionary/data_dictionary_rb002.md` (authoritative data dictionary)

### Priority 2 — Entity Resolution
- `/specs/features/entity_resolution.feature` — 24 scenarios
- `/specs/adrs/rb002/ADR-005_Layered_Entity_Resolution.md` through `ADR-020_Invoice_Graph_Admission_Rule.md`

### Priority 3 — Directory Integrity
- `/specs/features/directory_consistency.feature` — 6 scenarios
- `/specs/features/directory_accuracy.feature` — 4 scenarios
- `/specs/features/directory_reliability.feature` — 2 scenarios
- `/specs/features/directory_traceability.feature` — 4 scenarios
- `/specs/adrs/rb003/ADR-021` through `ADR-024`

### Priority 4 — Operator UI
- `/specs/features/operator_ui_and_verification.feature` — 11 scenarios
- `/specs/adrs/rb004/ADR-025` through `ADR-031`

### Priority 5 — Non-Functional Requirements
- `/specs/features/non_functional_requirements.feature` — 7 scenarios
- `/specs/adrs/rb005/ADR-032` through `ADR-040`

### Also Read
- `/specs/data_dictionary/data_dictionary_rb003.md` (directory state entities)
- `/specs/data_dictionary/data_dictionary_rb004.md` (UI entities)
- `/planning/requirements_map.md` (full ADR register and group status)

---

## 3. Confirmed Architectural Decisions

These decisions are closed. Do not re-open them.

| Decision | Resolution | ADR |
|---|---|---|
| Database | PostgreSQL on Railway, relational schema | Pre-confirmed |
| Data format | CSV upload, 3 columns (`creditor_name`, `debtor_name`, `amount_due`), one creditor per file | ADR-002, ADR-004 |
| Validation | All data assumed valid for canary. No validation or error handling on input. | ADR-003 |
| Entity status model | Two orthogonal axes: `participation_status` (platform_user / third_party) × `verification_status` (unresolved / resolved) | ADR-009 |
| Matching confidence | Three tiers: high (auto-match), medium (operator review), low (new node). Configurable thresholds. | ADR-013 |
| Prefer false negatives | System prefers creating a duplicate over incorrectly merging distinct entities | ADR-006 |
| Authentication | Single hard-coded operator account. No self-service auth. | ADR-031 |
| Canary UI scope | Lightweight, functional, throwaway. No design system. | ADR-030 |
| Deployment | Dockerfile (`node:18-alpine`), Railway, `DATABASE_URL` env var, public HTTPS | ADR-034 |
| API versioning | All endpoints under `/api/v1/` | ADR-039 |

---

## 4. Six Black-Box Modules — Canary Dispositions

The entity resolution pipeline depends on six modules that are interface-defined in the ADRs but need implementation guidance. For the canary, implement each as follows. **These are intentionally simple.** The interfaces are defined in the ADRs so that each module can be replaced by a functional implementation later without changing the surrounding code.

| Module | ADR | Canary Implementation |
|---|---|---|
| **Matching Module** | ADR-013 | Simple rule-based: exact match after normalisation = high confidence, partial match (e.g., Levenshtein distance or similar) = medium confidence, no match = low confidence. |
| **Name Normalisation** | ADR-017 | Simple rule-based: lowercase, strip common suffixes (Ltd, Limited, Inc, PLC, etc.), trim whitespace, collapse multiple spaces. |
| **Canonical Name Assignment** | ADR-015 | Simple rule: use the name from the first invoice that created the node, updatable by operator via review queue. |
| **Geographical Classification** | ADR-014 | Stub: accept and store any value provided. No validation or lookup. |
| **Creditor Verification** | ADR-018 | Stub: all creditors registered via the operator workflow (ADR-031) are automatically set to `verification_status: resolved`. |
| **External Dataset Interface** | ADR-019 | Stub: interface defined per ADR-019. Always returns "no match found." |

### Modular Replacement Strategy

Each module must be implemented behind a clean interface as defined in its ADR. The canary implementations above are stand-ins. The intention is to develop functional replacements through focused requirements-and-build cycles after the canary is validated. When you implement these modules, ensure the interface boundary is clean enough that swapping in a new implementation requires no changes to the calling code.

---

## 5. Test Data Scenarios

Test CSV files matched to the test scenarios will be provided . You do not need to generate the test data yourself.

The **test data specification** is at `/specs/test_data/test_data_specification.md`. Read it. It describes:

- **3 creditors** registered on the platform before any uploads
- **3 CSV files** uploaded in sequence, each exercising different entity resolution behaviours
- **11 invoices** across the three files
- **9 expected business nodes** in the final directory state
- **1 contact entity** linked to a business node
- **3 operator review queue items** (one reject, one accept, one data conflict)
- **1 external dataset seed** (4 records, schema at `/specs/test_data/external_dataset.csv`)

The specification includes the **expected outcome for every row** in every CSV file, including confidence tier, entity status, geographical classification, and operator actions. Use these expected outcomes to write your assertions and integration tests.

### Key Scenarios Exercised

| Scenario | What It Tests |
|---|---|
| Scenario 1 (Corner Shop) | Low-confidence matching, new node creation, geographical classification (local/remote), name normalisation (suffix stripping) |
| Scenario 2 (Smith & Jones) | High-confidence cross-file matching, medium-confidence matching, operator reject (do_not_match rule), operator accept (node merge), contact entity creation |
| Scenario 3 (Quick-Print) | High-confidence matching, external dataset secondary search, company number uniqueness constraint, data conflict review queue item |

### What You Need to Do

1. Read the test data specification.
2. Seed the external dataset table using the schema from `/specs/test_data/external_dataset.csv` and the four records described in the specification.
3. When the test CSV files are provided, use them to run the three scenarios in order and verify the expected outcomes.
4. Write integration tests that assert the final directory state matches the specification (9 nodes, 1 contact, 11 invoices, 3 review queue items).

---

## 6. Build Priorities

The specification is substantial (40 ADRs, 64 Gherkin scenarios, 7 feature files). Not everything may be buildable in a single session. If you need to prioritise, use this order:

### Must Have (the canary is not a canary without these)
1. **Database schema and migrations** — the relational model for business nodes, invoices, audit trail events, and review queue items.
2. **CSV ingestion pipeline** — upload a CSV, parse it, create/match business nodes, create invoice records.
3. **Entity resolution with simple matching** — the three-tier confidence logic with the simple matching module.
4. **Directory data table** — the operator can see all business nodes with status, aliases, and last-seen date.
5. **Activity Feed** — the operator can see what happened after an ingestion and verify correctness.

### Should Have (significantly improves the canary's value)
6. **Operator review queue** — medium-confidence matches presented for operator decision.
7. **Creditor registration workflow** — operator registers a new creditor before uploading their invoices.
8. **Audit trail** — complete event logging per ADR-012 and ADR-024.

### Could Have (nice but not blocking)
9. **Directory filtering and sorting** — filter by participation/verification status, sort by columns.
10. **Do-not-match rules** — operator can prevent specific entities from being matched in future.
11. **Health check endpoint** — `/healthz` per ADR-035.

### Will Not Have (deferred by design)
- Pending invoice promotion (unreachable in canary — see PI-009)
- Graceful degradation (ISS-002)
- Idempotent ingestion (ISS-001)
- UI pagination (ISS-009)
- Application-level metrics (ISS-010)

---

## 7. Deployment

### Railway Configuration
- **Runtime:** Docker (Dockerfile in repo root)
- **Base image:** `node:18-alpine` (ADR-034)
- **Database:** PostgreSQL (already provisioned on Railway)
- **Environment variable:** `DATABASE_URL` (provided by Railway)
- **Public URL:** Provided by Railway
- **HTTPS:** Provided by Railway (ADR-034)

### Dockerfile Guidance
Neither team member has built a Docker image before. A minimal Dockerfile for a Node.js application on Railway:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Adjust the entry point and build steps as needed for your chosen framework. Railway will build from the Dockerfile automatically on every push to `main`.

### Database Migrations
Use a migration framework (ADR-038). Migrations must run automatically on deployment. Do not rely on manual migration steps.

---

## 8. Known Canary Limitations

These are documented limitations, not bugs. Do not attempt to fix them.

| Limitation | Reference |
|---|---|
| No invoice will ever enter `pending` state because all creditors are registered as `resolved` | PI-009, ISS-007 |
| No data validation or error handling on CSV input | ADR-003 |
| Single operator, no multi-user support | ADR-031 |
| No UI pagination | ISS-009 |
| No graceful degradation if a module fails | ISS-002 |
| `ATTRIBUTE_CHANGED` event type defined but untested | PI-005 |

---

## 9. The Atomicity Scenario

The non-functional requirements feature file includes a scenario testing transaction atomicity: "a malformed CSV file that contains 5 valid rows and 1 invalid row." This creates a surface tension with ADR-003 (all data assumed valid). The intent is to test that the ingestion pipeline rolls back completely on a processing error — not that it validates input. Implement this as a test for a processing failure (e.g., a row that causes a database constraint violation), not as input validation logic.

---

## 10. What Is Preserved vs. Throwaway

All functionality specified in RB-001 (Invoice Ingestion), RB-002 (Entity Resolution), and RB-003 (Directory State and Integrity) is intended to be preserved into the production system. Build it with care.

The operator UI (RB-004) is throwaway — functional but not designed. Build it to work, not to last.

Many of the NFRs (RB-005) are canary-scoped and may be revisited for production. The exceptions are the "preserved functionality protections" (ADR-036 through ADR-040: XSS prevention, i18n framework, DB migrations, API versioning, structured error responses) — these are low-cost-now, high-cost-to-retrofit-later decisions that apply to the preserved code.

---