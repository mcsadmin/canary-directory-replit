# ADR-035: Canary Logging and Observability

**Date:** 16 March 2026
**Status:** Accepted

## Context

The non-functional requirements brief (RB-005) asks what level of logging and observability is required for the canary, beyond the functional audit trail (ADR-012, ADR-024) and the operator-facing Activity Feed (ADR-029). Decisions are needed on application-level logging, error reporting, and health monitoring.

## Decision

The canary will adopt a minimal and platform-leveraged approach to logging and observability:

1.  **Application Logs:** The application will log standard, unstructured operational messages (e.g., server start, database connection, processing errors) directly to `stdout` and `stderr`. No structured logging format (e.g., JSON) is required for the canary.

2.  **Error Reporting:** The built-in logging provided by the Railway platform is considered sufficient for error reporting. The development team will monitor the Railway deployment logs to identify and diagnose issues. No external error reporting service (e.g., Sentry, Bugsnag) will be integrated for the canary.

3.  **Health Checks:** The application must expose a single, unauthenticated HTTP `GET` endpoint at `/healthz`. This endpoint will return a `200 OK` status with a simple JSON body `{"status": "ok"}` if the application is running and can successfully connect to the database. If the database connection fails, it should return a `503 Service Unavailable` status. Railway will be configured to monitor this endpoint.

## Rationale

This approach is proportionate to the canary's needs and aligns with the principle of leveraging the deployment platform's capabilities. 

-   Logging to `stdout`/`stderr` is the standard practice for containerized applications and integrates seamlessly with Railway's log viewer. Avoiding structured logging for the canary simplifies the coding agent's task.
-   Relying on Railway's logs for error reporting is sufficient for a non-production environment with a small development team.
-   A `/healthz` endpoint is a standard and effective mechanism for platform-based health monitoring, providing a simple way to ensure the application and its critical dependencies (the database) are operational.

## Consequences

-   The coding agent must implement the `/healthz` endpoint as specified.
-   The Railway service configuration should be updated to use the `/healthz` endpoint for health checks.
-   The development team will rely on the Railway console for log viewing and error detection.

## Review Trigger

This decision should be revisited if debugging issues proves difficult with unstructured logs, or if more sophisticated monitoring and alerting capabilities are required for the canary.
