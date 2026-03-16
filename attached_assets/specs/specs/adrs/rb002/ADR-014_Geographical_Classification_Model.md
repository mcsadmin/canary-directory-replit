# ADR-014: Geographical Classification Model

**Date:** 15 March 2026
**Status:** Accepted

## Context

To build a graph of the **local** economy, the system must be able to determine whether a given business node is inside or outside the platform's defined geographical catchment area. This classification is fundamental to the platform's core purpose. The logic for this classification must be decoupled from the core entity resolution workflow to maintain separation of concerns.

## Decision

A new attribute, `geographical_status`, will be added to the `Business Node` entity. This attribute will have one of three possible ENUM values:

1.  `local`: The entity is confirmed to be within the defined catchment area.
2.  `remote`: The entity is confirmed to be outside the defined catchment area.
3.  `uncertain`: The system does not have enough information to make a determination.

The logic for determining this status will be encapsulated in a separate **Geographical Classification Module**. The core system will simply pass available entity data (e.g., address, postcode) to this module and receive one of the three statuses in return. The module itself is treated as a black box by the core entity resolution and data management logic.

## Rationale

This decision architecturally isolates the logic for geographical classification. This is beneficial because:

*   **Separation of Concerns:** The complex and potentially varied logic for geocoding, postcode matching, and boundary analysis is kept separate from the main business logic.
*   **Testability:** The core system's use of the status is easy to test (e.g., "does the node's status get set correctly?"). The classification module can be tested independently.
*   **Flexibility:** The internal workings of the classification module can be changed (e.g., switching from a simple postcode lookup to a more sophisticated third-party geocoding API) without affecting any other part of the system.

## Consequences

*   **New Module Required:** The Geographical Classification Module must be designed, built, and tested as a distinct work item. Its interface with the core system must be formally defined.

## Review Trigger

This decision should be revisited if the definition of "local" becomes more complex than a simple geographical boundary (e.g., if it involves business sector or other non-geographical criteria).
