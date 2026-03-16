# ADR-012: Audit Trail Requirements

**Date:** 15 March 2026
**Status:** Accepted

## Context

To ensure transparency, debuggability, and future improvement of the entity resolution process, a complete record of all matching and merging decisions must be maintained. The system must be able to demonstrate precisely why a particular invoice was matched to a specific business node, or why a new node was created.

## Decision

For every invoice processed, the system will create a detailed audit log of the entity resolution attempt. This log must be durably stored and linked to the source invoice. The audit log must contain, at a minimum:

1.  The unique ID of the source invoice.
2.  The raw `debtor_name` and any other debtor-related fields from the invoice.
3.  A list of all candidate `Business Node` entities considered for matching from the internal directory.
4.  The confidence score calculated for each candidate.
5.  The final outcome of the resolution (e.g., matched to node X, new node Y created, flagged for review, merged with node Z, skipped by operator).
6.  A timestamp for the resolution event.

## Rationale

This comprehensive audit trail is non-negotiable for a system that will eventually have financial implications. It is essential for:

*   **Debugging:** When a matching error occurs, the audit log provides the necessary data to understand and rectify the failure.
*   **Operator Review:** An operator reviewing a flagged entity needs to see the full context of the system's decision-making process.
*   **Algorithm Improvement:** A historical dataset of matching attempts, scores, and outcomes is invaluable for training and refining future versions of the matching algorithm.
*   **Traceability:** It provides a clear and unambiguous answer to the question: "Why did the system do that?"

## Consequences

*   **High-Volume Data Generation:** The requirement to log every attempt for every invoice will result in a very large volume of audit data. The production system will require a robust data management strategy for these logs, including log rotation, archival to cheaper storage (e.g., S3), and potentially a separate data store optimized for this type of data.
*   **Storage Costs:** The storage volume will have direct cost implications that must be factored into the operational budget of the platform.

## Review Trigger

This decision should be revisited if the cost of storing and managing the audit logs becomes prohibitive, or if a less detailed logging mechanism is proven to be sufficient for debugging and traceability needs.
