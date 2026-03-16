# ADR-032: Canary Performance Targets

**Date:** 16 March 2026
**Status:** Accepted

## Context

The non-functional requirements brief (RB-005) requires a decision on the performance characteristics of the canary. While the canary is a validation tool and not a production system, establishing minimal performance targets is necessary to ensure it is usable for testing and provides a realistic baseline for future development. The key areas of concern are ingestion throughput and UI responsiveness.

## Decision

The following performance targets are established for the canary:

1.  **Ingestion Throughput:** The ingestion of a CSV file containing up to 1,000 invoice records must be completed, with the summary report displayed to the operator, within **10 seconds**.

2.  **UI Responsiveness:** All UI interactions, including sorting and filtering the directory table, loading the review queue, and viewing the Activity Feed, must complete within **2 seconds**.

3.  **Concurrent Usage:** The canary is designed for single-user access. No performance targets are defined for concurrent usage scenarios. This is consistent with ADR-031, which specifies a single, hard-coded operator account.

## Rationale

These targets are proportionate to the canary's purpose. The 10-second target for ingestion provides a reasonable upper bound for operator feedback, preventing the UI from appearing unresponsive during the processing of moderately sized test files. The 2-second target for UI responsiveness ensures a fluid and non-frustrating user experience for the operator during validation tasks.

Explicitly scoping out concurrent usage simplifies the development and testing effort, aligning with the canary's role as a functional, not a production, prototype.

## Consequences

-   The coding agent must implement the ingestion pipeline and UI in a manner that can meet these performance targets.
-   Automated performance tests should be created to verify these targets are met as part of the continuous integration process.
-   These targets provide a concrete baseline against which the performance of the production system can be specified and measured.

## Review Trigger

This decision should be revisited if the canary needs to be used for larger-scale data testing that would exceed these performance envelopes, or if the user feedback indicates that the defined targets are insufficient for effective validation work.
