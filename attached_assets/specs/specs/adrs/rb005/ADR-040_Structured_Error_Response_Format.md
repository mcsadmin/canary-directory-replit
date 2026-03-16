# ADR-040: Structured Error Response Format

**Date:** 16 March 2026
**Status:** Accepted

## Context

When an API request fails, the response should provide clear, consistent, and machine-readable information about the nature of the error. The canary project has deferred general UI error handling (ISS-008), but the format of error responses from the *API* is part of the preservable backend functionality. Ad-hoc or inconsistent error formats make building robust client applications difficult.

## Decision

All error responses from the API (i.e., responses with a 4xx or 5xx status code) must conform to a single, consistent JSON structure. The standard error body will be:

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "A human-readable explanation of the error."
  }
}
```

-   `code`: A stable, uppercase, snake-cased string that uniquely identifies the class of error. This is for programmatic use by the client.
-   `message`: A developer-facing message explaining the error. This message is not intended to be shown directly to end-users, as it may contain technical details. The i18n framework (ADR-037) should be used to present user-friendly messages in the UI.

## Rationale

This decision ensures that the API is predictable, even in failure cases. A consistent error format allows API clients (including the future production UI) to build a single, reusable mechanism for handling all API errors. The client can use the `code` for specific logic (e.g., `INVALID_CREDENTIALS` might trigger a logout) while using the `message` for logging and debugging. Establishing this convention now is a low-cost way to improve the developer experience and robustness of all future API integrations.

## Consequences

-   The coding agent must implement a centralized error handling middleware or utility in the backend that formats all error responses according to this structure.
-   A list of standard error codes should be maintained as part of the API documentation.

## Review Trigger

This decision should be revisited only if a widely adopted standard for JSON API error responses (like JSON:API or Problem Details for HTTP APIs) is formally adopted by the project.
