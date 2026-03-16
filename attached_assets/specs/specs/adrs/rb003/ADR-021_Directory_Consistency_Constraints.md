# ADR-021: Directory Consistency Constraints

**Date:** 15 March 2026
**Status:** Accepted

## Context

To be considered a reliable source of truth, the business directory must adhere to a strict set of internal rules, or invariants. These rules ensure that the data within the directory is structurally sound and internally consistent, regardless of the operations being performed. This ADR formally defines these non-negotiable constraints.

## Decision

The system will enforce the following consistency constraints at all times. Any operation that would result in a violation of these constraints must be rejected.

1.  **Uniqueness Constraints:**
    *   The `node_id` attribute of a business node must be unique across all nodes in the directory.
    *   The `company_number` attribute, if present, must be unique across all nodes. No two nodes can share the same company number.

2.  **Completeness Constraints (Presence of data):**
    *   Every business node must have a valid `participation_status` and `verification_status` as defined in ADR-009.
    *   A `canonical_name` may be an empty string if, and only if, the business node was created solely from `invoice_aliases` and has not been enriched with any `non_invoice_aliases`. In all other cases, the `canonical_name` must be non-empty.

3.  **Referential Integrity Constraints:**
    *   Every invoice must be linked to exactly one creditor and one debtor node. There can be no orphan invoices.
    *   Every invoice alias stored against a business node must be linked to the creditor who used it.

4.  **State Transition Constraints:**
    *   The system will enforce valid transitions between verification statuses (`unresolved`, `resolved`).
    *   A `resolved` entity can revert to `unresolved` only through an explicit operator decision. Conflicting data from new invoices does not automatically change the status of a resolved entity. All status changes must be explicitly logged.

## Rationale

These constraints are the bedrock of the directory's integrity. They prevent data corruption, ensure structural soundness, and provide a predictable foundation for all other system operations. By defining these rules as mandatory and testable, we ensure that the directory remains a trustworthy asset.

## Consequences

*   All data modification operations (ingestion, merging, operator edits) must be designed to validate against these constraints before committing changes.
*   The system must provide clear error messages to operators or logs when an operation is rejected due to a constraint violation.

## Review Trigger

These constraints should be revisited if there is a fundamental change to the business node data model or the entity status model.
