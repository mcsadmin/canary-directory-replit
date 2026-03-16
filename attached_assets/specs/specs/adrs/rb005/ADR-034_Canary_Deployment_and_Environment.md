# ADR-034: Canary Deployment and Environment

**Date:** 16 March 2026
**Status:** Accepted

## Context

The non-functional requirements brief (RB-005) requires decisions on the deployment environment for the canary project. This includes the containerization strategy, platform configuration, management of secrets, and access control. These decisions are necessary to guide the coding agent in creating a deployable and accessible application.

## Decision

The following deployment and environment specifications are established for the canary:

1.  **Containerization:** The application will be deployed as a Docker container. A `Dockerfile` must be present in the root of the repository. For the canary, a standard, single-stage `node:18-alpine` base image is sufficient. The coding agent is responsible for creating this file.

2.  **Deployment Platform:** The application will be deployed on Railway. No specific constraints on the plan, instance size, or region are required for the canary; default settings are acceptable.

3.  **Environment Variables:** The application must be configurable via environment variables. The primary variable required is `DATABASE_URL`, which will be provided by the Railway PostgreSQL service. No other external API keys or secrets are required for the initial canary scope.

4.  **Domain and Access:** The canary will be publicly accessible at `canary.commoner.services`. HTTPS is mandatory and will be automatically provisioned and managed by Railway. No IP-based access restrictions are required.

## Rationale

This set of decisions provides a clear and simple path to deployment for the coding agent. 

-   Using a standard **Docker** container is a modern, portable deployment practice and is required by Railway. Specifying a simple base image keeps the canary lightweight.
-   **Railway** is the confirmed platform from the working brief. Using default configurations is sufficient for the canary's non-intensive workload.
-   Managing configuration via **environment variables** is a standard best practice. Limiting the required variables simplifies the setup for the coding agent.
-   **Public, HTTPS-enabled access** is required for the team to test and validate the running application, as specified in the working brief's sandbox target.

## Consequences

-   The project repository must include a valid `Dockerfile`.
-   The coding agent will need to ensure the application correctly consumes the `DATABASE_URL` environment variable to connect to the database.
-   The Railway project will need to be configured with the custom domain `canary.commoner.services`.

## Review Trigger

This decision should be revisited if the canary's dependencies change to require additional secrets or environment variables, or if a private, access-restricted environment becomes necessary for security or testing reasons.
