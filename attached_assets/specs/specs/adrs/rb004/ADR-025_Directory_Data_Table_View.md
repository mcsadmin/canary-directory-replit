# ADR-025: Directory Data Table View

**Date:** 16 March 2026
**Status:** Accepted

## Context

The primary interface for an operator to understand and manage the business directory is a view of the business nodes. To be effective, this view must present the most operationally relevant information for an operator to assess the directory's state, identify potential issues, and navigate to specific entities of interest. The questions in RB-004 (Q1) require a formal decision on what information this table must contain.

## Decision

The primary operator view of the business directory will be a filterable and sortable data table. The table will display a curated set of attributes from the `Business Node` entity, along with key derived information.

**1. Displayed Columns:**

The following columns will be displayed in the data table:

| Column | Source | Description |
|---|---|---|
| `canonical_name` | `Business Node` | The clean, system-managed name for the entity. |
| `participation_status` | `Business Node` | ENUM: `platform_user` or `third_party`. |
| `verification_status` | `Business Node` | ENUM: `unresolved` or `resolved`. |
| `geographical_status` | `Business Node` | ENUM: `local`, `remote`, or `uncertain`. |
| `invoice_aliases` | `Business Node` | Displayed as a numeric count of aliases. The full list will be available via a popover or drill-down view. |
| `company_number` | `Business Node` | The entity's official company number, if known. |
| `last_seen_date` | Derived | The date of the most recent invoice associated with this node. |
| `invoice_count` | Derived | The total number of invoices associated with this node. |

**2. Sorting:**

The table will be sortable by the following columns:
- `canonical_name` (alphabetical, A-Z, Z-A)
- `last_seen_date` (chronological, newest first, oldest first)
- `invoice_count` (numerical, highest first, lowest first)

The default sort order will be `last_seen_date` descending (newest first).

**3. Filtering:**

The table will provide controls to filter the view based on:
- `participation_status` (e.g., show only `platform_user`)
- `verification_status` (e.g., show only `unresolved`)
- `geographical_status` (e.g., show only `local`)

## Rationale

This design provides the minimum information necessary for an operator to validate the state of the directory. The selected columns allow for verification of the core entity attributes and their status. The derived fields are included as they are essential for validating the effects of invoice ingestion over time.

In line with the canary UI scope (ADR-030), the implementation of this table should use a standard, off-the-shelf component. The goal is functional validation, not a polished user experience. Advanced features like per-user customizable views or rich cell interactions are out of scope. Pagination is also explicitly out of scope for the canary (see ISS-009).

## Consequences

- The application backend must provide an API endpoint capable of efficiently querying and returning the directory data, including the calculated derived fields (`last_seen_date`, `invoice_count`).
- The UI component for the data table must implement the specified sorting and filtering controls.

## Review Trigger

This decision should be revisited if operator feedback indicates that other attributes from the `Business Node` entity are frequently required for their daily workflows, or if the performance of calculating the derived fields becomes a bottleneck.
