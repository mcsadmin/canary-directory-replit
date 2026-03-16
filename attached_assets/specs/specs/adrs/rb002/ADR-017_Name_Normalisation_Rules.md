# ADR-017: Name Normalisation Module

**Date:** 15 March 2026
**Status:** Accepted

## Context

To effectively compare business names, the system must first clean and standardise them. A consistent normalisation process is required to ensure that trivial variations (e.g., case, punctuation, legal form abbreviations) do not prevent the system from identifying potential matches. This process must be applied to all incoming names from invoices and all existing names in the directory before they are passed to the Matching Module for scoring.

## Decision

The process of name normalisation will be encapsulated in a separate **Name Normalisation Module**. This module will expose a single, simple interface to the core system:

`normalise_name(raw_name: str) -> str`

*   **Input:** The `raw_name` is any un-processed name string from any source.
*   **Output:** The function will return a single, normalised string.

The implementation of this module is a separate concern. The core system will only interact with this defined interface. All name comparisons will be performed on the normalised strings returned by this module.

## Rationale

This decision architecturally isolates the logic for name cleaning and standardisation, consistent with the pattern established for matching (ADR-013), geographical classification (ADR-014), and canonical name assignment (ADR-015). This has several key benefits:

*   **Separation of Concerns:** The core system is not burdened with the details of string manipulation and legal form dictionaries.
*   **Testability:** The core system's use of the module is easy to test. The normalisation module can be tested independently.
*   **Flexibility:** The algorithm inside the normalisation module can be improved over time (e.g., by adding more sophisticated rules or handling more languages) without any changes to the core entity resolution workflow.

## Consequences

*   **New Module Required:** The Name Normalisation Module must be designed, built, and tested as a distinct work item.

## Review Trigger

This decision should be revisited if the normalisation requirements become so simple that a dedicated module is considered overkill.
