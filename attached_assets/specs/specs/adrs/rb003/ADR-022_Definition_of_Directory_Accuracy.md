# ADR-022: Definition of Directory Accuracy

**Date:** 15 March 2026
**Status:** Accepted

## Context

The term "accurate" can be ambiguous. For a system like the Local Loop Directory, which is built from inherently messy and incomplete data, a naive definition of accuracy as a perfect one-to-one mapping with the real world is unachievable and operationally dangerous. A precise, risk-aware definition is required.

## Decision

Directory Accuracy is formally defined as the property that **every business node in the directory corresponds to at most one real-world entity.**

This decision explicitly prioritises the avoidance of false positives (incorrectly merging two distinct entities) over the elimination of false negatives (creating duplicate nodes for the same real-world entity). This is a direct application of the principle established in ADR-006.

Under this definition:

*   An **"accurate"** directory is one that contains no incorrect merges.
*   The presence of duplicate nodes for the same real-world entity is an **accepted and designed-for consequence** of the system's risk-averse matching strategy, not a defect in its accuracy.
*   The system's primary mechanism for improving accuracy over time is not preventing duplicates at all costs, but providing excellent tools for an operator to safely review and resolve duplicates (as specified in ADR-016).

## Rationale

This definition provides a clear, testable, and operationally safe standard. A false positive (an incorrect merge) can lead to direct financial or reputational harm by misattributing invoices or clearing payments incorrectly. A false negative (a duplicate) represents a missed opportunity for connection, which is a far less severe failure mode. This definition forces the system to fail safely.

## Consequences

*   The entity resolution logic must be strictly configured to only perform automatic merges on the highest-confidence matches (i.e., scores exceeding the `Upper Confidence Threshold` from ADR-013).
*   The system must deliberately create new, separate nodes for low-confidence matches.
*   The operator review queue becomes the primary tool for managing and improving the directory's alignment with the real world over time.

## Review Trigger

This definition should be revisited if the business context changes such that the cost of a false negative becomes greater than the cost of a false positive.
