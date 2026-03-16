# ADR-018: Creditor Verification Module

**Date:** 15 March 2026
**Status:** Accepted

## Context

The integrity of the obligation graph is paramount. Every edge (obligation) in the graph is a claim being made by a creditor. If the identity of the creditor is uncertain, the validity of the claim itself is compromised. The system must not allow ambiguous or unverified entities to introduce data into the graph. The logic for this verification must be decoupled from the main ingestion pipeline.

## Decision

At the point of ingestion, before any other processing takes place, the system will perform a verification check on the creditor by calling a dedicated **Creditor Verification Module**. This module will expose a single, simple interface:

`is_valid_creditor(creditor_id: UUID) -> bool`

*   **Input:** The `creditor_id` is the unique identifier of the user session submitting the file.
*   **Output:** The function will return `true` if the creditor is a valid, resolved platform user, and `false` otherwise.

If the module returns `false`, the invoices within the file will not be processed into the main invoice graph. Instead, they will be created and held in a **pending state**, linked to the unresolved creditor. The system will provide a clear message to the user explaining that their invoices have been received but are pending creditor verification.

## Rationale

This decision architecturally isolates the logic for creditor verification. It enforces a strict "trust but verify" policy at the system boundary, ensuring that every invoice entering the graph comes from a known, trusted source. By encapsulating the logic in a black-box module, the core ingestion pipeline is simplified and the verification rules can be updated independently.

## Consequences

*   **New Module Required:** The Creditor Verification Module must be designed, built, and tested as a distinct work item.
*   **Ingestion Pipeline Update:** A new, high-priority validation step must be added to the beginning of the invoice ingestion pipeline that calls this module.
*   **User Experience:** The user interface must be able to handle and clearly display the status of pending invoices.
*   **Group 1 Artefact Impact:** This decision introduces a new validation step that logically precedes the processing described in the Group 1 `invoice_ingestion.feature` file. That file will need to be updated in a future session to reflect this new initial step.

## Review Trigger

This decision should be revisited if the platform ever needs to support data ingestion from non-user or unverified sources, which would represent a fundamental change to its trust model.
