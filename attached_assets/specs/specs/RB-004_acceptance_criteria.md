# RB-004 Acceptance Criteria

This document lists the formal acceptance criteria for the
Operator UI and Verification requirements group (RB-004).
Each criterion is an observable condition that must be met
for the implementation to be considered complete.

---

### Must Have: A working invoice graph with verified nodes

**AC-04-01: The operator can view and navigate the
business directory.**
*   **Linked to:** Must Have: A working invoice graph
    with verified nodes
*   **Confirmed by:** Executing Scenarios 2 and 3 in
    `operator_ui_and_verification.feature` and confirming
    the data table displays correctly with functioning
    sorting and filtering.

**AC-04-02: The operator can register a new creditor.**
*   **Linked to:** Must Have: A working invoice graph
    with verified nodes
*   **Confirmed by:** Executing Scenario 1 in
    `operator_ui_and_verification.feature` and confirming
    the new business node is created with the correct
    participation and verification status.

**AC-04-03: The operator can ingest new invoice data for
a specific creditor and verify the outcome.**
*   **Linked to:** Must Have: A working invoice graph
    with verified nodes
*   **Confirmed by:** Executing Scenario 4 in
    `operator_ui_and_verification.feature` and confirming
    the summary report is accurate, and Scenario 8
    (Activity Feed) reflects the changes.

### Must Have: A mechanism for an operator to resolve
ambiguity with minimal human input

**AC-04-04: The operator can process items in the review
queue.**
*   **Linked to:** Must Have: A mechanism for an operator
    to resolve ambiguity with minimal human input
*   **Confirmed by:** Executing Scenarios 5 and 6 in
    `operator_ui_and_verification.feature` and confirming
    that accepting and rejecting matches works as
    specified.

**AC-04-05: Operator feedback permanently improves the
matching process.**
*   **Linked to:** Must Have: A mechanism for an operator
    to resolve ambiguity with minimal human input
*   **Confirmed by:** Executing Scenario 7 in
    `operator_ui_and_verification.feature`, which proves
    that a `do_not_match` rule created by an operator
    prevents future incorrect suggestions.

### Must Have: A complete, auditable trail of all matching
and merging decisions

**AC-04-06: The operator can trace system and user actions
via the Activity Feed.**
*   **Linked to:** Must Have: A complete, auditable trail
    of all matching and merging decisions
*   **Confirmed by:** Executing Scenarios 8 and 9 in
    `operator_ui_and_verification.feature`, confirming
    that both ingestion and manual merge events are
    clearly and accurately reported.

**AC-04-07: The operator can use general actions in the review queue.**
*   **Linked to:** Must Have: A mechanism for an operator to resolve ambiguity with minimal human input
*   **Confirmed by:** Executing Scenarios 10 and 11 in `operator_ui_and_verification.feature`, confirming that reclassifying and skipping items works as specified.
