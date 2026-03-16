# CANARY-06: Operator UI Frontend

- **Status:** Not Started
- **Depends On:** CANARY-04
- **Requirements:** ADR-025, ADR-026, ADR-027, ADR-028, ADR-029, ADR-030, ADR-031

---

## Implementation Plan

React + Vite app in `artifacts/operator-ui/`. Generated via generateFrontend() using OpenAPI-generated hooks.

Pages:
1. **Directory view** (default) — sortable/filterable data table of business nodes (ADR-025 columns)
2. **Upload view** — creditor dropdown, file input, progress feedback, summary report modal (ADR-026)
3. **Review Queue view** — list of pending items with badge count in nav (ADR-027)
4. **Review Queue Detail** — side-by-side comparison with Accept/Reject/Skip actions (ADR-027)
5. **Creditor Registration** — simple form (canonical name input, submit) (ADR-031)
6. **Activity Feed** — chronological list of audit events (ADR-029)

Auth: pre-configured single operator account. No login UI needed for canary (ADR-031).

## Acceptance Criteria

- Operator can see all business nodes in filterable table
- Operator can upload CSV and see summary modal
- Operator can accept/reject/skip review items
- Operator can register a new creditor
- Activity feed shows recent events
