# RB-002 Acceptance Criteria

This document lists the formal acceptance criteria for the Entity Resolution and Directory Management requirements group (RB-002). Each criterion is an observable condition that must be met for the implementation to be considered complete.

---

### Must Have: A robust, accurate, and reliable directory of local businesses

**AC-01: The system creates a new, unresolved business node when no match is found.**
*   **Linked to:** Must Have: A robust, accurate, and reliable directory of local businesses
*   **Confirmed by:** Executing Scenario 1 in `entity_resolution.feature`.

**AC-02: The system correctly distinguishes between a business and a contact person.**
*   **Linked to:** Must Have: A robust, accurate, and reliable directory of local businesses
*   **Confirmed by:** Executing Scenarios 2 and 3 in `entity_resolution.feature`.

**AC-03: The system automatically merges high-confidence matches.**
*   **Linked to:** Must Have: A robust, accurate, and reliable directory of local businesses
*   **Confirmed by:** Executing Scenario 4 in `entity_resolution.feature`.

**AC-04: The system creates new nodes for low-confidence matches.**
*   **Linked to:** Must Have: A robust, accurate, and reliable directory of local businesses
*   **Confirmed by:** Executing Scenario 6 in `entity_resolution.feature`.

**AC-05: The system correctly handles the lifecycle of platform users and third-party entities.**
*   **Linked to:** Must Have: A robust, accurate, and reliable directory of local businesses
*   **Confirmed by:** Executing Scenarios 8, 9, and 10 in `entity_resolution.feature`.

**AC-06: The system correctly assigns a geographical status to new business nodes.**
*   **Linked to:** Must Have: A robust, accurate, and reliable directory of local businesses
*   **Confirmed by:** Executing Scenarios 14, 15, and 16 in `entity_resolution.feature`.

**AC-07: The system assigns a canonical name to new business nodes.**
*   **Linked to:** Must Have: A robust, accurate, and reliable directory of local businesses
*   **Confirmed by:** Executing Scenario 17 in `entity_resolution.feature`.

**AC-08: The system correctly applies name normalisation rules before matching.**
*   **Linked to:** Must Have: A robust, accurate, and reliable directory of local businesses
*   **Confirmed by:** Executing Scenario 25 in `entity_resolution.feature`.

### Must Have: A mechanism for an operator to resolve ambiguity with minimal human input

**AC-09: The system flags medium-confidence matches for operator review.**
*   **Linked to:** Must Have: A mechanism for an operator to resolve ambiguity with minimal human input
*   **Confirmed by:** Executing Scenario 5 and Scenario 18 in `entity_resolution.feature`.

**AC-10: An operator can accept or reject a proposed match.**
*   **Linked to:** Must Have: A mechanism for an operator to resolve ambiguity with minimal human input
*   **Confirmed by:** Executing Scenarios 19 and 20 in `entity_resolution.feature`.

**AC-11: An operator can merge duplicate records.**
*   **Linked to:** Must Have: A mechanism for an operator to resolve ambiguity with minimal human input
*   **Confirmed by:** Executing Scenario 11 in `entity_resolution.feature`.

**AC-12: An operator can reclassify an entity from a business to a contact.**
*   **Linked to:** Must Have: A mechanism for an operator to resolve ambiguity with minimal human input
*   **Confirmed by:** Executing Scenario 24 in `entity_resolution.feature`.

### Must Have: A complete, auditable trail of all matching and merging decisions

**AC-13: The system logs all entity resolution attempts.**
*   **Linked to:** Must Have: A complete, auditable trail of all matching and merging decisions
*   **Confirmed by:** Executing Scenario 7 in `entity_resolution.feature`.

**AC-14: The system logs all operator decisions from the review queue.**
*   **Linked to:** Must Have: A complete, auditable trail of all matching and merging decisions
*   **Confirmed by:** The `Then` steps in Scenarios 19 and 20 that require the decision to be recorded in the audit trail.

### Must Have: A secure mechanism for ingesting data from trusted sources

**AC-15: The system holds invoices from unresolved creditors in a pending state.**
*   **Linked to:** Must Have: A secure mechanism for ingesting data from trusted sources
*   **Confirmed by:** Executing Scenario 21 in `entity_resolution.feature`.

