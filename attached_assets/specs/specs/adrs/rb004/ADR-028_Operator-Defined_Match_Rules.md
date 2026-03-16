# ADR-028: Operator-Defined Match Rules

**Date:** 16 March 2026
**Status:** Accepted

## Context

The entity resolution process is designed to learn from operator feedback. When an operator rejects a proposed match in the review queue (ADR-027), the system should not propose the same incorrect match again in the future. Conversely, when an operator confirms a match that the system was uncertain about, this provides a strong positive signal. A formal mechanism is needed to store and apply these operator decisions, as noted in issue PI-008.

## Decision

A new `match_rules` table will be introduced to the database. This table will store explicit rules created by operators during the review process. Each rule will link two `Business Node` entities and specify a matching constraint.

**1. Data Model:**

| Field | Data Type | Description |
|---|---|---|
| `rule_id` | UUID | A unique identifier for the rule. |
| `node_id_a` | UUID | The ID of the first business node in the pair. |
| `node_id_b` | UUID | The ID of the second business node in the pair. |
| `rule_type` | ENUM (`do_not_match`) | The constraint to apply to this pair of nodes. |
| `created_by` | UUID | The `operator_id` of the user who created the rule. |
| `created_at` | timestamp | The timestamp when the rule was created. |

**2. Rule Application:**

The Matching Module (responsible for calculating confidence scores) must be updated to query this table before returning candidates to the entity resolution logic.

*   If a `do_not_match` rule exists between a candidate pair, the Matching Module must discard that candidate and not include it in the results, regardless of its calculated similarity score.


**3. Rule Creation:**

Rules are created exclusively by operators through the actions defined in ADR-027:

*   Rejecting a proposed match **must** create a `do_not_match` rule.
*   The `do_match` rule has been deferred (ISS-006) and is out of scope for the canary.

## Rationale

This decision provides a mechanism to validate that operator feedback can be persisted and used to improve the matching logic. It directly addresses the core of PI-008. The `do_not_match` rule is the primary mechanism for this validation.

In line with the canary UI scope (ADR-030), the UI for this should be minimal. The creation of the `do_not_match` rule should be an automatic consequence of the 'Reject Match' action. The `do_match` rule has been deferred (ISS-006) and is out of scope for the canary. The key validation is that a rejected match is not proposed again.

## Consequences

-   **Data Model Extension:** A new `match_rules` table must be added to the database schema.
-   **Matching Module Update:** The logic for the Matching Module must be significantly updated to incorporate querying and applying these rules, overriding its standard scoring algorithm where applicable.
-   **UI Update:** The operator review interface (ADR-027) must implement the `Reject Match` action such that it automatically creates a `do_not_match` rule.

## Review Trigger

This decision should be revisited if the management of these rules becomes overly complex, or if a more sophisticated machine learning approach is adopted that can learn from operator feedback without requiring explicit rule creation.
