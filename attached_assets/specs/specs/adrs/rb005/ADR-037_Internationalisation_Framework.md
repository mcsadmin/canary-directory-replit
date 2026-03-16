# ADR-037: Internationalisation (i18n) Framework

**Date:** 16 March 2026
**Status:** Accepted

## Context

While the canary UI (RB-004) is a throwaway prototype, the core application logic and data models are intended for future production use. To avoid a difficult and error-prone retrofit later, all user-visible strings should be managed within an internationalisation (i18n) framework from the very beginning.

## Decision

All user-facing strings in the application, including UI labels, error messages, and content in the Activity Feed, must be managed through an i18n framework. This has two concrete implications:

1.  **No Hard-coded Strings:** No user-visible text will be hard-coded directly in the application's source code (UI components or backend logic). All such strings must be replaced with a key that references an entry in a locale file.

2.  **Use a Standard i18n Library:** A standard, well-maintained library for i18n (e.g., `i18next` for React/Node.js environments) must be integrated into the application from the start. The initial setup will include a default locale file (e.g., `en.json`) where all strings will be stored.

For the canary, only the English (`en`) locale file needs to be created and populated. No other languages are in scope.

## Rationale

This decision enforces a critical separation of concerns between code and content. By abstracting all user-visible text into a centralized framework, the application becomes immediately localizable. Even if only one language is used initially, this structure makes adding new languages a simple matter of providing a new translation file, rather than a complex and risky code refactoring exercise. This is a low-overhead, high-value architectural decision that protects the future adaptability of the application.

## Consequences

-   The coding agent must integrate an appropriate i18n library and ensure all UI components and backend-generated messages use it correctly.
-   A new file (or set of files) for storing the locale strings will be added to the repository structure.
-   This imposes a small but consistent development discipline on the creation of any new user-facing feature.

## Review Trigger

This decision should not be revisited. It is a foundational principle for building scalable, user-facing applications.
