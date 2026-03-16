# ADR-013: Confidence Threshold Model for Entity Resolution

**Date:** 15 March 2026
**Status:** Accepted

## Context

The entity resolution process must handle ambiguity. The system needs a clear, testable, and maintainable mechanism for deciding whether an incoming debtor name from an invoice should be automatically matched to an existing business node, flagged for human review, or used to create a new, unverified node. The logic for this decision must be decoupled from the complex and evolving logic of how a confidence score is calculated.

## Decision

The entity resolution process will be governed by two system-level configurable thresholds:

1.  **Upper Confidence Threshold:** A numeric value (e.g., 80) representing the minimum score for an automatic, high-confidence match.
2.  **Lower Confidence Threshold:** A numeric value (e.g., 15) representing the minimum score for a medium-confidence match that requires operator review.

The core entity resolution module will operate as follows:

1.  It will receive a set of candidate matches for a given debtor name from a separate **Matching Module**.
2.  Each candidate will have a confidence score from 0 to 100, calculated by the Matching Module.
3.  The resolution module will take the single highest-scoring candidate and apply the following logic:
    *   If `score >= Upper Confidence Threshold`, the debtor is automatically matched to that candidate.
    *   If `Lower Confidence Threshold <= score < Upper Confidence Threshold`, the debtor is not matched, and a new unresolved record is created. A potential link between the new record and the candidate is flagged for operator review.
    *   If `score < Lower Confidence Threshold`, a new unresolved record is created with no suggested link.

## Rationale

This decision architecturally decouples the **what** (the outcome of a match attempt) from the **how** (the calculation of the confidence score). This has several key benefits:

*   **Testability:** The core resolution logic is reduced to a simple set of threshold comparisons, which is trivial to test.
*   **Maintainability:** The complex logic for calculating confidence scores is isolated within the Matching Module, which can be updated, improved, or even replaced without affecting the core resolution workflow.
*   **Configurability:** Placing the threshold values in a configuration file allows them to be tuned in production without requiring a code change or a new deployment.

## Consequences

*   **Configuration Management:** The two threshold values must be added to the system's configuration management.

## Review Trigger

This decision should be revisited if a requirement emerges for per-creditor or per-entity-type thresholds, which would add significant complexity to the configuration and the resolution logic.
