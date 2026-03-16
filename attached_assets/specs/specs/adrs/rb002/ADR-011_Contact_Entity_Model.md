# ADR-011: Contact Entity Model

**Date:** 15 March 2026
**Status:** Accepted

## Context

Invoice data can be ambiguous, sometimes naming an individual person as the debtor (e.g., "John Smith") even when the context implies a business relationship (e.g., at the address of "Jones & Sons Plumbers"). The system must be able to distinguish between a business entity (`Business Node`) and a named person (`Contact`) who may be associated with one or more businesses. Treating a person as a business is a category error that would corrupt the graph.

## Decision

A new, distinct `Contact` entity will be introduced to the system's data model. 

*   A **`Business Node`** represents a legal or trading entity (e.g., a limited company, a sole proprietorship trading under a business name).
*   A **`Contact`** represents a named human being.

The system's entity resolution logic will be updated to attempt to classify an invoice debtor as either a potential business or a potential contact. A `Contact` can be linked to one or more `Business Nodes` with an associated role (e.g., 'Director', 'Employee', 'Accounts Payable').

For the canary, the logic will be simple: if an invoice's `debtor_name` appears to be a person's name, the system will create a `Contact` entity. This Contact will then be associated with a Business Node, which can be the same as the Contact entity name, if there is sufficient evidence (e.g., a shared address and a business-like name on other invoices).

## Rationale

This separation is critical for maintaining the integrity of the obligation graph. The graph connects businesses, not people. By creating a distinct `Contact` entity, the system can correctly model the real-world situation where an invoice is addressed to a specific person *at* a business. This prevents the pollution of the business directory with personal names and allows for a more accurate representation of economic relationships.

It also provides a foundation for future functionality, such as managing communications with specific people at a company or understanding the roles of individuals within the local economy.

## Consequences

*   **Data Model Extension:** A new `Contact` table must be added to the database schema, with a many-to-many relationship to the `Business Node` table.

## Review Trigger

This decision should be revisited if the platform's core purpose expands from B2B relationships to include B2C (Business-to-Consumer) obligations, which would require a more sophisticated model of individual consumers as graph nodes.
