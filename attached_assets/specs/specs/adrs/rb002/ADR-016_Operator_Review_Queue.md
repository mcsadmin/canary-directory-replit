# ADR-016: Operator Review Queue

**Date:** 15 March 2026
**Status:** Accepted

## Context

The entity resolution process is designed to be automated but must escalate to a human operator when it encounters ambiguity (e.g., medium-confidence matches, data conflicts). A formal mechanism is required to manage these escalations, present the necessary information to the operator, and record their decisions.

## Decision

A new `Operator Review` entity will be introduced to the system's data model. Each time the system flags a case for review, a new record will be created in the `operator_reviews` table. This record will contain all the information necessary for an operator to make an informed decision.

**Data Model:**

| Field | Data Type | Description |
|---|---|---|
| `review_id` | UUID | A unique identifier for the review item. |
| `review_type` | ENUM | The category of decision required (e.g., `proposed_match`, `data_conflict`, `contact_classification`). |
| `source_invoice_id` | UUID | The invoice that triggered the review. |
| `candidate_node_id` | UUID | The existing node the system is proposing to match against (if applicable). |
| `new_node_id` | UUID | The new, unresolved node created pending the review. |
| `raw_debtor_details` | JSONB | The original debtor data from the invoice. |
| `confidence_score` | number | The score that placed this item in the review queue. |
| `status` | ENUM | The current state of the review item (`pending`, `accepted`, `rejected`). |
| `operator_id` | UUID | The ID of the operator who made the decision. |
| `decision_timestamp` | timestamp | The time the decision was made. |

**Operator Actions:**

An operator can perform one of the following actions on a `pending` review item:

1.  **Accept:** Confirms the system's proposed action (e.g., merge the nodes).
2.  **Reject:** Rejects the system's proposed action (e.g., confirms the nodes are distinct).
3.  **Reclassify:** Changes the classification of an entity (e.g., from `Business Node` to `Contact`).
4.  **Skip:** Defers the decision, leaving the review item in the `pending` state for a later session.

**Auditing:**

Every operator action on a review item will be recorded as part of the system's audit trail, as defined in ADR-012. The audit log for an operator decision will be linked to the original automated match attempt audit record, creating a complete, end-to-end history of the resolution process for that invoice.

## Rationale

This decision formalises the human-in-the-loop aspect of the entity resolution process. It provides a structured, auditable mechanism for managing exceptions, which is critical for data quality and system transparency. By defining the review queue as a first-class data entity, it enables the development of a dedicated operator UI (Group 4) and ensures that all operator decisions are captured and can be used to improve the automated models over time.

## Consequences

*   **Data Model Extension:** A new `operator_reviews` table must be added to the database schema.
*   **Data Integrity Constraints:** The implementation of operator actions must be carefully constrained to prevent any action that could violate the integrity of the data model. For example, reclassifying a business node with many linked invoices to a contact must be handled in a way that preserves or correctly re-assigns those links.

## Review Trigger

This decision should be revisited if the range of operator actions needs to be expanded or if more complex review workflows are required.
