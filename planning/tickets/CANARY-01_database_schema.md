# CANARY-01: Database Schema and Migrations

- **Status:** Not Started
- **Depends On:** None
- **Requirements:** ADR-001, ADR-007, ADR-009, ADR-010, ADR-011, ADR-012, ADR-013, ADR-016, ADR-021, ADR-028, ADR-038

---

## Implementation Plan

Create all Drizzle ORM table definitions in `lib/db/src/schema/`. Tables required:

1. `business_nodes` — canonical_name, participation_status, verification_status, geographical_status, company_number, created_at, updated_at (node_id UUID PK)
2. `invoice_aliases` — alias text, creditor_node_id FK, business_node_id FK (many-to-many with provenance)
3. `invoices` — invoice_id UUID, creditor_node_id FK, debtor_node_id FK, amount_due, status (active/pending), optional fields (debtor_address, debtor_email, debtor_company_number, debtor_vat_number, debtor_postcode, debtor_website, debtor_phone, debtor_contact_name), ingested_at
4. `contacts` — contact_id UUID, name, created_at
5. `contact_business_links` — contact_id FK, business_node_id FK, role
6. `operator_reviews` — review_id UUID, review_type ENUM, source_invoice_id FK, candidate_node_id FK, new_node_id FK, raw_debtor_details JSONB, confidence_score, status ENUM (pending/accepted/rejected), operator_id, decision_timestamp
7. `audit_events` — event_id UUID, event_type, entity_id, entity_type, payload JSONB, operator_id, created_at
8. `match_rules` — rule_id UUID, node_id_a FK, node_id_b FK, rule_type ENUM (do_not_match), created_by, created_at
9. `external_data` — full 23-column schema from external_dataset.csv
10. `operators` — operator_id UUID, username, password_hash (single seeded account)
11. `ingestion_batches` — batch_id UUID, creditor_node_id FK, filename, total_rows, new_invoices, pending_invoices, new_nodes, new_review_items, created_at

Push schema with `pnpm --filter @workspace/db run push`.

## Acceptance Criteria

- All tables exist in PostgreSQL with correct types, PKs, FKs, and unique constraints
- `company_number` uniqueness enforced at DB level
- `node_id` UUID default generated at DB level
- Schema exported from `@workspace/db`
