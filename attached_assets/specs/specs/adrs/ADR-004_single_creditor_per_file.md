# ADR-004: Each CSV File Represents a Single Creditor

**Date:** 15 March 2026
**Status:** Accepted

## Context

During the requirements session for Invoice Ingestion (RB-001), the question of whether a single CSV file could contain invoices from multiple creditors was raised. A decision was needed to define the structural constraint on the ingestion format.

## Decision

Each CSV file submitted for ingestion will contain invoices from a single creditor only. The `creditor_name` field will therefore be consistent across all rows in a given file.

## Rationale

This constraint reflects the real-world context of invoice ingestion: creditors submit their own invoice data. It is natural and appropriate for each submission to represent one creditor's view of their outstanding invoices. Permitting mixed-creditor files would introduce complexity in the ingestion process and in the subsequent entity resolution step, without any corresponding benefit for the canary.

## Consequences

- The ingestion process can treat the `creditor_name` as a file-level attribute rather than a row-level attribute, simplifying processing.
- The Gherkin scenarios for invoice ingestion must be written with this constraint in mind: test cases will always describe a single creditor submitting invoices to one or more debtors.
- Multi-creditor batch files are out of scope for the canary. This is not a scenario the system needs to handle.

## Review Trigger

This decision should be revisited if the project scope expands to support bulk data imports from third-party aggregators or accounting platforms that may combine invoices from multiple creditors in a single export.
