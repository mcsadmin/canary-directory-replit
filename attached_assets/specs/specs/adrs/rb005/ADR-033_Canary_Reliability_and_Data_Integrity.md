# ADR-033: Canary Reliability and Data Integrity

**Date:** 16 March 2026
**Status:** Accepted

## Context

The non-functional requirements brief (RB-005) raises critical questions about the reliability and data integrity guarantees for the canary. Decisions are needed on data persistence across deployments, the atomicity of transactions, and the strategy for backup and recovery. These decisions must align with the canary's purpose as a validation tool whose core data processing logic is intended to be preserved into production.

## Decision

The following reliability and data integrity principles are established for the canary:

1.  **Data Persistence:** The canary's PostgreSQL database **must persist** across deployments. It is not acceptable for the graph data to be lost on redeployment. This requires configuring a persistent volume for the database service on the deployment platform (Railway).

2.  **Transaction Integrity:** Invoice ingestion **must be atomic**. For any given CSV file, either all valid invoice records within it are successfully processed and committed to the database, or none are. Partial processing of a file is not acceptable. If an unrecoverable error occurs during the processing of a file, the entire transaction for that file must be rolled back.

3.  **Backup and Recovery:** No automated backup mechanism is required for the canary. The recovery strategy in case of catastrophic data loss is to **start fresh** by redeploying the application and re-ingesting the test datasets. The persistence of the database volume is considered sufficient protection against common deployment-related data loss.

## Rationale

This set of decisions provides a pragmatic balance between the canary's validation goals and the need to protect the core, preservable functionality. 

-   **Persistent Data** is essential for meaningful testing. The ability to build up a graph state over multiple sessions and deployments is critical for validating the entity resolution and directory integrity logic (RB-002, RB-003).
-   **Atomic Ingestion** is a core requirement for the data pipeline, which is intended to be preserved. Enforcing this principle in the canary ensures that this critical piece of production-intent logic is validated from the outset. It prevents the creation of a partially-processed, inconsistent graph state.
-   **Deferring Automated Backups** is a reasonable trade-off for the canary. The risk of data loss beyond what the persistent volume protects against is low, and the effort to implement a full backup and recovery solution is not justified for a non-production environment with controlled test data.

## Consequences

-   The deployment configuration on Railway must be explicitly set up to use a persistent volume for the PostgreSQL service.
-   The coding agent must implement the invoice ingestion pipeline within a transactional boundary to ensure atomicity. The Gherkin scenario for a malformed file will serve as the primary test for this rollback behavior.
-   The project's operational documentation should note that the recovery procedure for the canary is to redeploy and re-ingest data.

## Review Trigger

This decision should be revisited if the canary's role expands to include being a long-running demonstration environment where the preservation of a specific, complex data state becomes critical.
