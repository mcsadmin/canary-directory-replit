# ADR-038: Database Migration Framework

**Date:** 16 March 2026
**Status:** Accepted

## Context

The canary's data model is already non-trivial and is expected to evolve. Managing changes to the PostgreSQL database schema manually with SQL scripts is error-prone, difficult to version, and makes reproducing a specific schema state unreliable. To ensure the database schema remains a consistent and versioned asset, a formal migration process is needed from the outset.

## Decision

All changes to the database schema must be managed through an automated migration framework. The specific choice of framework is left to the coding agent, but it must be a standard, well-maintained tool compatible with the chosen database and language stack (e.g., Prisma Migrate, Drizzle Kit).

1.  **Initial Schema as Migration Zero:** The creation of the initial database schema, based on the entities defined in RB-001 through RB-004, will constitute the first migration file (or set of files).

2.  **All Changes via Migrations:** Any subsequent change to the schema—adding a table, dropping a column, adding an index—must be implemented by creating a new, versioned migration file using the framework's tooling. No manual changes via `psql` or another direct database tool are permitted against the development or production database.

## Rationale

This decision establishes a disciplined, repeatable, and version-controlled process for evolving the database schema. It has several key benefits:

-   **Traceability:** Provides a complete, auditable history of every change made to the database schema.
-   **Reproducibility:** Allows any version of the schema to be recreated reliably in any environment.
-   **Safety:** Modern migration tools can detect potential data loss scenarios and provide warnings.

Adopting this practice from the start is a low-overhead measure that avoids the significant technical debt and high-risk manual processes associated with retrofitting a migration framework onto a live, populated database.

## Consequences

-   The coding agent must select and integrate a suitable migration framework at the beginning of the project.
-   The repository will contain a new directory (`/migrations` or similar) to store the versioned migration files.
-   The deployment process must include a step to run any pending migrations before the application starts.

## Review Trigger

This decision should not be revisited. It is a foundational practice for modern database management.
