# ADR-007: Business Node Data Model

**Date:** 13 March 2026
**Status:** Accepted

## Context

A single real-world business entity can be referred to by many different names across various sources. Invoices may use idiosyncratic or abbreviated names, while websites or other sources may use different trading names. The system needs a data model that can reconcile these different aliases while maintaining a stable, internal identifier.

## Decision

Every business entity (node) in the Local Loop Directory will be structured with three distinct name attributes:

1.  **Canonical Name:** A single, clean, and unambiguous name for the entity, to be used for internal system processes and display where a neutral name is required. This name will be managed by the system.
2.  **Invoice Aliases:** A list of all the unique idiosyncratic names used to refer to this entity on the invoices of its various creditors. Each alias will be stored with a link to the creditor(s) who used it.
3.  **Non-Invoice Aliases:** A list of other known names for the entity, such as legal names, trading names from websites, or names from external datasets.

## Rationale

This model is based on two key distinctions:

1.  **Canonical vs. Alias:** Since no official, universal third-party name exists, the system must create its own definitive `canonical_name`. All other names are treated as aliases with varying degrees of ambiguity.
2.  **Invoice vs. Non-Invoice Alias:** This distinction reflects the provenance of the alias. `non-invoice_aliases` (e.g., a registered company name, a website trading name) are names the entity is aware of or has chosen for itself. `invoice_aliases` are created by creditors and are outside the entity's control or awareness, making them potentially more idiosyncratic.

This separation allows the system to maintain a clean internal state while preserving the messy, real-world data needed for accurate matching and user-friendly display.

## Consequences

-   **UI Implications:** The system can now support advanced UI features, such as showing a creditor the specific debtor name they are familiar with, as per requirement #4.
-   **Data Schema Complexity:** The database schema must support a many-to-many relationship between creditors and invoice aliases.
