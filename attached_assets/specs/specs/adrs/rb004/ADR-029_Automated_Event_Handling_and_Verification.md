# ADR-029: Automated Event Handling and Verification

**Date:** 16 March 2026
**Status:** Accepted

## Context

Requirements brief RB-004 raises two critical, related questions. First (Q4 / IR-04), what is the mechanism for promoting pending invoices when an unresolved creditor becomes resolved? Second (Q5), how does an operator verify system behaviour "with minimal effort," including detecting unexpected outcomes? Both questions relate to the system's transparency and automation.

## Decision

To address these questions, two mechanisms will be implemented: an automated, event-driven process for pending invoice promotion, and a user-facing Activity Feed for verification.

**1. Automated Pending Invoice Promotion:**

The promotion of pending invoices will be an automated, asynchronous background process that requires no direct operator action.

*   **Trigger:** When a `Business Node`'s `verification_status` is successfully updated from `unresolved` to `resolved`.
*   **Action:** A system event will be triggered. A handler for this event will query for all invoices in the `pending` state where the `creditor_id` matches the newly resolved node.
*   **Process:** Each of these pending invoices will be re-submitted to the main entity resolution and graph admission pipeline for processing into the active invoice graph.
*   **Auditing:** The successful promotion of these invoices will be recorded in the audit trail, linked to the original status change event.

**2. Operator Verification via Activity Feed:**

To allow operators to verify system behaviour, a user-facing **Activity Feed** will be implemented. This feed will serve as the primary, human-readable log of significant system events.

*   **Content:** The Activity Feed will display a chronological, curated list of events derived from the main audit trail (ADR-012, ADR-024). Events will include:
    *   Invoice file ingestion summaries (as defined in ADR-026).
    *   Business Node creation, merges, and status changes (including the actor: system or operator).
    *   Automated events, such as the promotion of a batch of pending invoices.
*   **Presentation:** Each event will be a clear, concise sentence (e.g., "Operator `John Doe` merged `Node B` into `Node A`.", "`15` pending invoices for `Creditor Corp` were automatically promoted to the active graph following verification.").
*   **Function:** This feed directly exposes the consequences of operator actions and automated processes, allowing for the easy detection of both expected and unexpected behaviour.

**Canary Scope Note:**

The Gherkin scenario and acceptance criterion for this automated promotion mechanism have been deferred (ISS-007) as the normal canary workflow makes the `pending` state unreachable. The specification is retained for logical completeness.

## Rationale

Automating the pending invoice promotion is the most reliable and efficient solution. It removes the burden from the operator and ensures the system's logic can be validated. This directly resolves the specification gap identified in IR-04.

The Activity Feed provides the simplest possible solution to the verification problem. It allows an operator to confirm that an action had an effect, which is the core of the validation requirement.

In line with the canary UI scope (ADR-030), the Activity Feed should be implemented as a simple, non-interactive, read-only log display. It is a tool for developers and testers to validate backend events, not a polished feature for operational monitoring. No filtering, searching, or user-specific customization is required.

## Consequences

-   **Backend Development:** A robust event-driven architecture is required to handle the automated promotion of pending invoices. A new service or handler must be built to listen for status change events and re-process the associated invoices.
-   **API and Frontend Development:** An API endpoint is needed to serve the curated Activity Feed data. The frontend must implement a UI component to display this feed.
-   **Audit Trail Curation:** Logic must be developed to transform the detailed, low-level data in the audit trail into the concise, human-readable messages for the Activity Feed.

## Review Trigger

This decision should be revisited if the volume of automated events becomes so high that the Activity Feed is too noisy to be useful, which might require more sophisticated filtering or summarization capabilities.
