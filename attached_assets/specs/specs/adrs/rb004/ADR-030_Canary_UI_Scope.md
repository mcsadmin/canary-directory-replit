# ADR-030: Canary UI Scope Constraint

**Date:** 16 March 2026
**Status:** Accepted

## Context

Following the initial drafting of requirements for the operator UI (RB-004), a clarification on the scope and purpose of the user interface for the canary project is required. The initial drafts implied a level of polish and functionality suitable for a production system. The user has provided a constraint to clarify the intent.

## Decision

The user interface built for the canary project will be a **lightweight, throwaway interface primarily for the validation of canary functionality.** It is not intended for heavy-duty operator usage and will not be public-facing.

This principle has the following concrete implications:

1.  **Standard Components:** The UI will be built using standard component libraries. No time will be spent on custom styling or complex graphical design.
2.  **Desktop-First:** The UI will be designed for desktop use. Responsive design for mobile or tablet is out of scope.
3.  **Function over Form:** The primary goal of the UI is to make the backend functionality visible and testable. Workflows should be functional and clear, but not necessarily polished or optimized for operational speed.
4.  **Validation, Not Production:** Features will be implemented to the minimum level required to validate the core backend logic as specified in the Gherkin scenarios. Production-level UI features like comprehensive user preferences, advanced analytics dashboards, or highly optimized workflows are out of scope.

## Rationale

This decision formally captures the user's explicit constraint. It focuses the development effort on the core goal of the canary project: validating the backend data processing and graph integrity. By defining the UI as a throwaway validation tool, it prevents scope creep and unnecessary investment in a user interface that is not the primary artefact being tested.

## Consequences

-   All other ADRs and requirements artefacts related to the UI (specifically those in RB-004) must be read and interpreted through the lens of this constraint.
-   The coding agent will be instructed to prioritize functionality and clarity using standard components, and to disregard aesthetic polish or responsive design.
-   ADRs 025, 026, 027, 028, and 029 will be immediately revised to reflect this constraint.

## Review Trigger

This decision should only be revisited if the core goal of the canary project changes from backend validation to include user experience testing.
