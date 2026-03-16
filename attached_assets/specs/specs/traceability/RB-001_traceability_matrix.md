# Traceability Matrix: RB-001 Invoice Ingestion

| Scenario | Feature Section | Primary ADR(s) | Notes |
|---|---|---|---|
| A creditor submits a single invoice | Invoice Ingestion | ADR-001, ADR-002, ADR-003, ADR-004 | Tests the minimum valid batch size (one invoice). |
| A creditor submits multiple invoices to multiple debtors | Invoice Ingestion | ADR-001, ADR-002, ADR-003, ADR-004 | Tests the core batch ingestion behaviour: one creditor, many debtors. |
| A creditor submits multiple invoices to the same debtor | Invoice Ingestion | ADR-001, ADR-002, ADR-003, ADR-004 | Tests that each row creates a distinct invoice record, even when the creditor-debtor pair repeats. |
| A creditor submits an empty CSV file | Invoice Ingestion | ADR-002, ADR-003 | Tests graceful handling of a valid but empty file (header row only). |
| A creditor submits an invoice with a zero amount due | Invoice Ingestion | ADR-001, ADR-003 | Tests that a zero-value invoice is accepted and stored as a valid invoice record. |
| An invoice with optional data fields is processed correctly | Invoice Ingestion | ADR-010, ADR-002, ADR-003 | Tests that the extended invoice data model (8 optional fields) is correctly ingested and stored. Added during RB-002 session. |
