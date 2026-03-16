# ADR-010: Extended Invoice Data Model

**Date:** 15 March 2026
**Status:** Accepted
**Supersedes:** [ADR-001: Minimal Invoice Data Structure for Canary](../RB-001/ADR-001_invoice_data_structure.md)

## Context

The initial invoice data model defined in ADR-001 was intentionally minimal (four fields: `invoice_id`, `creditor_name`, `debtor_name`, `amount_due`) to serve the most basic graph construction. However, the entity resolution requirements for RB-002 make it clear that additional, optional data points from an invoice are critical signals for matching and verification. A disciplined extension of the model is required to support this functionality without abandoning scope control.

## Decision

The official invoice data model is extended to include the following optional fields. The system must be capable of ingesting and processing these fields if they are present in the source data, but it must not fail if they are absent.

**Mandatory Fields:**
*   `invoice_id`: UUID (System-assigned)
*   `creditor_name`: string
*   `debtor_name`: string
*   `amount_due`: number

**Optional Fields:**
*   `debtor_address`: string
*   `debtor_email`: string
*   `debtor_company_number`: string
*   `debtor_vat_number`: string
*   `debtor_postcode`: string
*   `debtor_website`: string
*   `debtor_phone`: string
*   `debtor_contact_name`: string

## Rationale

This extension is a direct and necessary consequence of the entity resolution requirements. Fields like `debtor_address` and `debtor_email` are crucial for calculating match confidence, as defined in the Gherkin scenarios for ambiguous data. While not guaranteed to be present, their availability provides strong signals that significantly improve the accuracy of the entity resolution process. Capturing them at the point of ingestion is the only way to make them available to the matching logic.

This decision maintains scope discipline by only adding fields that are demonstrably necessary for the functionality being built in the current requirements group (RB-002). It avoids adding fields for future, undefined analytical purposes.

## Consequences

*   **Ingestion Pipeline Update:** The data ingestion mechanism must be updated to recognise and parse these new optional fields from incoming CSV files.

## Review Trigger

This decision should be revisited if the scope expands to require further analytical capabilities that depend on additional invoice-level data (e.g., invoice date, line items).
