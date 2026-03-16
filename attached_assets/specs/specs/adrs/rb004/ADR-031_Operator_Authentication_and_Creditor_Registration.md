# ADR-031: Operator Authentication and Creditor Registration

**Date:** 16 March 2026
**Status:** Accepted

## Context

The existing requirements artefacts (RB-001 to RB-004) imply the existence of authenticated operators and registered `platform_user` creditors, but do not specify the mechanism by which these are created or managed. This ADR clarifies the simple, pragmatic approach to be used for the canary, in line with the lightweight UI scope defined in ADR-030.

## Decision

Authentication and registration will be handled via simple, manual mechanisms sufficient for validating backend functionality.

**1. Operator Authentication:**

For the canary, there will be no self-service login or registration for operators. The system will be pre-configured with a single, hard-coded operator account. This ensures that all actions in the audit trail can be linked to a consistent `operator_id` without the overhead of building a full user management system.

**2. Creditor Registration:**

A business entity becomes a `platform_user` (i.e., a creditor for whom the operator can upload invoices) via a manual creation process within the UI. The operator will use a simple form to create a new `Business Node` with the following core attributes:

*   `canonical_name`
*   `participation_status`: Set to `platform_user`.
*   `verification_status`: Set to `resolved`.

This action creates a trusted entity in the directory that can be immediately used as the designated creditor for an invoice file upload. This process is the sole mechanism for creating new `platform_user` entities in the canary.

## Rationale

This approach provides the minimum functionality required to satisfy the system's logical dependencies. The system needs an `operator_id` for auditing and a way to create `resolved` `platform_user` entities to test the invoice admission rules (ADR-018, ADR-020). 

By making these processes manual and minimal, we avoid the significant effort of building production-grade user management and onboarding workflows, which are out of scope for the canary (ADR-030). This decision allows development to focus on the core data processing and graph integrity challenges.

## Consequences

-   The UI must include a simple form for creating a new `platform_user` business node.
-   The backend must provide an API endpoint to handle this creation.
-   The system will need a mechanism (e.g., a database seed) to create the initial hard-coded operator account.

## Review Trigger

This decision should be revisited if the scope of the canary expands to include testing of user onboarding or multi-operator workflows.
