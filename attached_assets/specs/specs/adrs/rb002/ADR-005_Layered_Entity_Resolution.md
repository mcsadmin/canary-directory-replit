# ADR-005: Layered Entity Resolution for Business Nodes

**Date:** 13 March 2026
**Status:** Accepted

## Context

Invoice data in the UK is an inherently unreliable source for business identification. There is no requirement for businesses on an invoice to be officially registered, to have a universal unique identifier, or for the names used to be consistent or recognisable to a third party. This creates significant ambiguity when creating and maintaining business nodes in the invoice graph.

## Decision

To resolve business entities from invoice data, the system will employ a layered search strategy:

1.  **Primary Search:** The system will first attempt to match the entity against its own internal **Local Loop Directory**. This directory contains all business nodes known to the system, regardless of their participation or verification status (`platform_user`, `third_party`, `resolved`, `unresolved`).

2.  **Secondary Search:** If, and only if, no high-confidence match is found in the internal directory, the system will then attempt to match the entity against the **external private business dataset**.

3.  **Creation:** If no high-confidence match is found in either the primary or secondary search, a new, **unresolved** business record will be created in the internal Local Loop Directory. This record will be flagged for future review and potential merging.

## Rationale

This layered approach was chosen for several reasons:

-   **Prioritises Internal Data:** It correctly establishes the system's own compiled data as the primary source of truth, reducing dependency on the external dataset over time.
-   **Leverages External Data for Enrichment:** It uses the valuable external dataset as a powerful tool for bootstrapping and enriching the graph, without making it the master record for all entities.
-   **Ensures Data Integrity:** The fallback to creating a new, unresolved record ensures that no invoice data is ever discarded, upholding the principle of building a complete graph, while clearly marking ambiguous data as such.

## Consequences

This decision has several important consequences for the system architecture:

-   **External Data Ingestion Pipeline:** A separate, robust pipeline must be designed to handle periodic updates to the private dataset, including versioning and change management, to ensure the secondary search layer remains current.
-   **Data Reciprocation Mechanism:** A process must be designed and built to periodically export an augmented dataset (including newly discovered entities) back to the provider of the private data. This is a core functional requirement.
-   **Potential for Data Augmentation:** The question of whether to merge the external dataset into the internal one, or keep them separate, is a subsequent architectural decision. For the canary, they will be treated as separate sources.

## Review Trigger

This decision should be revisited if a public, authoritative, and universally adopted business identifier becomes available in the UK.
