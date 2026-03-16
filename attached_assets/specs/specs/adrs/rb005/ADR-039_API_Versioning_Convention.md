# ADR-039: API Versioning Convention

**Date:** 16 March 2026
**Status:** Accepted

## Context

The canary application will expose a set of backend API endpoints that the UI consumes. While the initial UI is a disposable prototype, the API itself is part of the preservable core functionality. As the application evolves, these API contracts (request and response shapes) will change. Without a versioning strategy, any change becomes a breaking change, making it impossible to support older clients or manage a gradual rollout of new features.

## Decision

All API routes exposed by the application must be prefixed with a version identifier. The initial version will be `v1`.

-   **Convention:** All API endpoints must follow the pattern `/api/v1/{resource}`. For example: `/api/v1/directory`, `/api/v1/review-queue`.
-   **Health Check Exclusion:** The `/healthz` endpoint is considered an operational endpoint, not a resource-based API, and is therefore excluded from this convention.

This convention must be applied from the outset.

## Rationale

This is a simple, low-overhead convention that provides significant future flexibility. By namespacing the entire API under a version, it creates a clear path for introducing a `v2` in the future. A `v2` can be deployed alongside `v1`, allowing different clients to upgrade at their own pace and preventing breaking changes from impacting the stability of the production system. Adopting this discipline now costs nothing but establishes a critical pattern for long-term maintainability.

## Consequences

-   The coding agent must implement the application's routing to enforce this `/api/v1/` prefix for all resource-based endpoints.
-   All frontend code that consumes the API must use the versioned paths.

## Review Trigger

This decision should not be revisited. It is a standard best practice for building maintainable APIs.
