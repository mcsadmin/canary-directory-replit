# ADR-027: Operator Review Queue Interface

**Date:** 16 March 2026
**Status:** Accepted

## Context

ADR-016 defined the data model for the `Operator Review` entity, and the entity resolution feature file specifies that medium-confidence matches and data conflicts should generate review items. However, the interface through which an operator interacts with these items, as raised in RB-004 (Q3), has not been specified. A clear and efficient interface is needed for operators to process the review queue.

## Decision

The Operator Review Queue will be presented to the operator as a dedicated, separate view within the application, accessible via a prominent UI element (e.g., a navigation link with a badge indicating the number of pending items).

**1. Queue View:**

The queue will be displayed as a list of pending review items, sorted with the oldest items first. Each item in the list will provide a concise summary of the review required.

**2. Detail View:**

Selecting an item from the queue will open a detailed comparison view. This view will present the two entities involved in the review side-by-side. For a `proposed_match` review, this will be the newly created node and the existing candidate node. For a `data_conflict` review, this will be the two nodes with conflicting authoritative data (e.g., the same company number).

The comparison view will clearly highlight the similarities and differences between the two entities, including all relevant fields from the `Business Node` and `Invoice` entities (e.g., names, addresses, company numbers, source invoice details).

**3. Operator Actions:**

From the detail view, the operator will have a clear set of actions they can take, corresponding to the decision required:

*   **For a `proposed_match`:**
    *   **`Accept Match`**: Merges the new node into the existing candidate node. All invoices and aliases are transferred to the candidate node. The new node is archived.
    *   **`Reject Match`**: Confirms the two nodes are distinct. A `do_not_match` rule is created between the two nodes to prevent future suggestions. The new node's `verification_status` remains `unresolved`.

*   **For a `data_conflict`:**
    *   **`Merge Nodes`**: Allows the operator to merge the two conflicting nodes, selecting which data to retain where conflicts exist.
    *   **`Mark as Distinct`**: Confirms the two nodes are separate entities despite the conflicting data. The operator may be prompted to correct the erroneous data on one of the nodes.

*   **General Actions (available for any review type):**
    *   **`Reclassify as Contact`**: Reclassifies a `Business Node` as a `Contact` entity. The original node is archived, and a new contact is created.
    *   **`Skip`**: Defers the decision on the current review item, leaving it in the `pending` state with no other changes.

All operator actions will be logged in the audit trail, as required by ADR-012 and ADR-024, linking the action to the `review_id` and the `operator_id`.

## Rationale

This design provides a minimal, functional workflow for validating the exception handling process. A dedicated queue is the simplest way to isolate items that require manual review. The side-by-side presentation of data, even if implemented simply, is the most effective way to provide the context needed for a validation decision.

In line with the canary UI scope (ADR-030), the interface should be implemented using standard components. The goal is to confirm that the backend correctly identifies items for review and correctly processes the operator's decision (accept/reject), not to build a highly efficient operational tool. The creation of `do_not_match` rules is a key part of validating that operator feedback is correctly persisted. Pagination is explicitly out of scope for the canary (see ISS-009).

## Consequences

-   The backend must provide an API to serve the list of pending review items and the detailed data for the comparison view.
-   The backend must also provide API endpoints to execute the operator actions (`Accept Match`, `Reject Match`, etc.), ensuring these operations are atomic and fully audited.
-   The frontend must implement the dedicated queue view, the side-by-side comparison component, and the UI controls for each operator action.

## Review Trigger

This decision should be revisited if new `review_type` values are introduced that require different UI presentations or operator actions.
