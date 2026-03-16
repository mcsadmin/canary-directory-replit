# ADR-019: External Data Module

**Date:** 15 March 2026
**Status:** Accepted

## Context

The entity resolution process, as defined in ADR-005, uses an external private business dataset as a secondary search layer. The core system needs a stable, well-defined interface for querying this dataset, and the module responsible for this needs a clear definition of its data source.

## Decision

The interaction with the external dataset will be abstracted behind a dedicated **External Data Module**. This module will expose a single, simple interface to the core system:

`find_external_match(details: dict) -> dict | null`

*   **Input:** The `details` dictionary will contain all available, normalised debtor information from the source invoice.
*   **Output:** If a single, high-confidence match is found, the function will return a dictionary representing the matched external record. Otherwise, it will return `null`.

The data source for this module will be a single **Postgres table** with a defined data structure. The External Data Module is solely responsible for all interaction with this table, including creating and maintaining any internal tooling (e.g., database indices) required to provide the `find_external_match` service efficiently.

## Rationale

This decision creates a strong architectural boundary. The core system is decoupled from the specifics of the external data source, while the developer of the External Data Module has a clear and concrete starting point (a Postgres table). This allows for parallel development and testing.

## Consequences

*   **New Module Required:** The External Data Module must be designed, built, and tested as a distinct work item.
*   **Interface Definition:** The exact structure of the Postgres table and the returned match dictionary must be formally defined.

## Review Trigger

This decision should be revisited if the external data source changes from a single Postgres table to a different format (e.g., a third-party API, multiple tables).
