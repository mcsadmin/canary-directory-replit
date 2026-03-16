# ADR-015: Canonical Name Assignment Model

**Date:** 15 March 2026
**Status:** Accepted

## Context

Every `Business Node` must have a single, clean, and unambiguous `canonical_name` for display and referencing purposes. The process for determining this name must be consistent and automated, especially when a node is created from multiple, potentially conflicting, source names (e.g., from different invoices or external datasets).

## Decision

The assignment of the `canonical_name` will be delegated to a separate **Canonical Name Module**. When a new `Business Node` is created or an existing one is updated with new name information, the core system will pass all available name data (e.g., all invoice aliases, any matched external data) to this module. The module will return a single string, which the system will set as the `canonical_name`.

The process will be fully automated. There will be no mechanism for an operator to manually override the canonical name chosen by the module. The module itself is treated as a black box by the core system.

## Rationale

This decision isolates the complex and potentially subjective logic of choosing the "best" name for a business. This has several advantages:

*   **Automation:** The process is fully automated, requiring no human intervention and ensuring consistency.
*   **Separation of Concerns:** The core system is not burdened with name-scoring or selection logic. It simply trusts the module to provide the correct name.
*   **Flexibility:** The algorithm inside the Canonical Name Module can be improved over time (e.g., to prefer names from authoritative sources, or to use more sophisticated normalisation) without any changes to the core entity resolution workflow.

## Consequences

*   **New Module Required:** The Canonical Name Module must be designed, built, and tested as a distinct work item. Its interface with the core system must be formally defined.

## Review Trigger

This decision should be revisited if a requirement for manual curation or operator override of canonical names emerges.
