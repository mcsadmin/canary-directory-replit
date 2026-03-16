# ADR-001: Minimal Invoice Data Structure for Canary

**Date:** 15 March 2026
**Status:** Accepted

## Context

The canary project requires a minimal data model for an invoice to begin building the invoice graph. The focus is on capturing only the essential information needed to create the graph edges (invoices) and to support the subsequent entity resolution of the graph nodes (businesses). The system must account for the fact that UK invoices are not legally required to have a unique identifier.

## Decision

An invoice within the system will be defined by the following four mandatory fields:

1.  `invoice_id`: A UUID assigned by the system upon ingestion, to ensure every invoice can be uniquely referenced across all uploads.
2.  `creditor_name`: The name of the creditor (supplier) as it appears on the invoice.
3.  `debtor_name`: The name of the debtor (customer) as it appears on the invoice.
4.  `amount_due`: The amount outstanding at the present time.

All other invoice-related data (e.g., invoice date, due date, line items, VAT) are considered out of scope for the canary.

## Rationale

This minimal structure directly serves the primary goal of the canary: to build the graph. The `creditor_name` and `debtor_name` fields provide the necessary inputs for the Entity Resolution process (Group 2), while the `amount_due` establishes the weight of the invoice (the edge in the graph). Assigning a unique `invoice_id` at the point of ingestion is a critical decision that guarantees data integrity and traceability within the system, compensating for the lack of a mandatory unique identifier in the source data.

Alternatives involving more complex data models were rejected as they would introduce unnecessary complexity for the canary and violate the "build the graph" principle by focusing on data that is not essential for the immediate task.

## Consequences

The primary consequence is that the entity resolution process will need to be robust enough to handle potentially ambiguous or inconsistent names provided in the `creditor_name` and `debtor_name` fields. The model is simple and fast to implement, but it pushes the complexity of data cleansing and matching into the next stage of the pipeline. This decision also means that any analysis requiring more detailed invoice data (e.g., trend analysis based on invoice dates) is not possible with this model.

## Review Trigger

This decision should be revisited when the project scope expands beyond the initial canary to incorporate more advanced analytical features or to ingest data from sources that provide richer invoice information.
