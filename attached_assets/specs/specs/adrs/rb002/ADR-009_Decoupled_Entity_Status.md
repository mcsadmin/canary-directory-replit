# ADR-009: Decoupled Entity Status Model

**Date:** 15 March 2026
**Status:** Accepted

## Context

The previous four-state model (`unresolved`, `resolved`, `registered`, `member`) as defined in the draft ADR-004 conflated two distinct concepts: an entity's relationship with the platform (`registered`, `member`) and the system's confidence in that entity's real-world identity (`unresolved`, `resolved`). This created a category error, leading to a brittle and confusing model (e.g., the 'member' catch-22 where data could only be ingested by entities that had already been resolved through ingestion). A clearer model is needed that separates these concerns.

## Decision

The single `status` attribute for a business node will be replaced by two independent attributes:

1.  **`participation_status`**: An ENUM describing the entity's relationship with the Local Loop platform. It has two possible values:
    *   `platform_user`: The entity has an active account on the Local Loop platform.
    *   `third_party`: The entity does not have an account and exists in the directory only as a counterparty on an invoice.

2.  **`verification_status`**: An ENUM describing the system's confidence in the entity's identity. It has two possible values:
    *   `unresolved`: The default state. The entity's identity has not been confirmed against a trusted source. This includes newly created entities from invoices and newly registered platform users.
    *   `resolved`: The entity's identity has been confirmed with high confidence, either through operator review or by matching against a trusted external dataset (for the canary, this is the private dataset defined in ADR-019).

These two attributes are orthogonal. A 'member' in the old terminology is now a `platform_user` who is also `resolved`. This model resolves the circular dependency for data ingestion. A business can sign up, becoming a `platform_user` with a status of `unresolved`, and can immediately begin submitting invoices. As per ADR-018, these invoices will be held in a pending state and will not be processed into the main invoice graph until the user's own `verification_status` is `resolved`.



## Rationale

This decoupled model is superior for several reasons:

*   **Clarity and Precision:** It eliminates the category error by treating participation and verification as separate, orthogonal concepts.
*   **Robustness:** It resolves the 'member' catch-22, providing a clear and logical path for new users to join the platform and begin contributing data before their own identity is fully resolved.
*   **Flexibility:** It allows for more precise and powerful queries (e.g., "Find all `platform_user` entities that are still `unresolved`", "Show me all `third_party` entities that are `resolved`").
*   **Simplicity:** The two binary states are easier to reason about and manage than the previous four-state model with its complex transitions.

## Consequences

*   **Pending Invoice Queue:** The ingestion pipeline must implement a mechanism to hold invoices submitted by `unresolved` `platform_user` entities in a pending state, and to process them into the main invoice graph once the user's `verification_status` is updated to `resolved`.

## Review Trigger

This decision should be revisited if a fundamental change occurs in the way the platform interacts with its users or with external data sources.
