# ADR-020: Invoice Graph Admission Rule

**Date:** 16 March 2026
**Status:** Accepted
**Belongs to:** Requirements Group 002 (amendment)

---

## Context

The system maintains an active invoice graph representing financial relationships between business entities. The entity status model (ADR-009) defines two orthogonal axes: `participation_status` and `verification_status`. The invoice data model (ADR-010) defines the structure of an invoice, which connects a creditor to a debtor. A rule is needed to define which invoices are admitted to the active graph based on the verification status of the entities they connect. This rule was surfaced during the RB-003 requirements session and is being formally documented here as an amendment to RB-002 for conceptual correctness.

## Decision

An invoice may only be part of the active invoice graph if its **creditor** (the entity that issued the invoice) has a `verification_status` of `resolved`. The `verification_status` of the **debtor** (the entity that received the invoice) has no bearing on whether the invoice is admitted to the active graph. Invoices issued by `unresolved` creditors are held in a `pending` state until the creditor's status is resolved.

## Rationale

The creditor is the entity making a financial claim. Admitting claims from unverified entities into the graph would undermine the graph's integrity — it would contain assertions of debt made by entities whose real-world identity has not been confirmed. Conversely, the debtor's verification status does not affect the validity of the claim being made against it; a trusted creditor's invoice is a legitimate record regardless of whether the debtor has been fully resolved.

## Consequences

*   The invoice ingestion process must check the `verification_status` of the creditor before adding an invoice to the active graph.
*   A mechanism must exist to hold invoices from `unresolved` creditors in a `pending` state and to re-evaluate them if the creditor's status changes to `resolved`.

## Review Trigger

This decision should be revisited if the business model changes to allow unverified entities to issue invoices into the graph, or if the definition of the invoice graph itself is fundamentally altered.
