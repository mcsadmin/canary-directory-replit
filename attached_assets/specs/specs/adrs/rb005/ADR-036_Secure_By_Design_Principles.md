# ADR-036: Secure by Design Principles

**Date:** 16 March 2026
**Status:** Accepted

## Context

The canary is a prototype, but its core data processing logic (RB-001, RB-002, RB-003) is intended for production use. To avoid a significant security-related rebuild later, it is prudent to incorporate foundational security principles from the outset, focusing on those that impose a low overhead during initial development.

## Decision

The canary will be built with the following "Secure by Design" principles, which are non-negotiable for all code produced by the coding agent:

1.  **Prevent SQL Injection:** All database queries that include variable data must use prepared statements (parameterized queries). Raw, un-sanitized data must never be concatenated into SQL strings.

2.  **Prevent Cross-Site Scripting (XSS):** All user-generated or database-sourced content rendered in the UI must be contextually escaped by default. The UI framework's standard mechanisms for preventing XSS must be used.

3.  **Use Standard Authentication Libraries:** Even for the single hard-coded operator account (ADR-031), the session management and authentication checks must be handled by a standard, well-maintained library. No custom authentication logic will be written.

4.  **Keep Dependencies Updated:** The project must use recent, stable versions of its core dependencies (frameworks, libraries). A mechanism to regularly check for and apply security updates should be considered a "Should Have" for the production system.

## Rationale

These principles represent the low-hanging fruit of web application security. They are fundamental best practices that have a high security return on investment. Implementing them now ensures that the core, preservable functionality is built on a secure foundation, making the future transition to a high-security, public-facing application a process of enhancement rather than a complete rewrite.

## Consequences

-   The coding agent must be explicitly instructed to adhere to these principles.
-   The choice of libraries for database access and authentication will be constrained to those that support these principles out of the box.
-   This adds a new layer of non-functional requirements that must be considered during code review and testing.

## Review Trigger

This decision should not be revisited. These are foundational principles for any modern web application.
