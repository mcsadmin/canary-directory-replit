# ADR-006: Prefer False Negatives over False Positives

**Date:** 13 March 2026
**Status:** Accepted

## Context

During the process of building the invoice graph from invoice data, the system will frequently encounter ambiguous situations where an entity's identity is not certain. Examples include similar names, shared addresses, or incomplete data. In these cases, the system must choose between incorrectly linking two distinct entities (a false positive) or failing to link two records that represent the same entity (a false negative).

## Decision

When faced with ambiguity during entity resolution, the system will always default to the action that creates a false negative rather than risking a false positive. It will create a new, separate, unverified record instead of merging or linking with an existing record unless there is conclusive, high-confidence evidence to support the match.

## Rationale

This decision is based on the core principle that false positives pose a direct financial and reputational risk, whereas false negatives represent a far less damaging opportunity cost. For analytical functions like invoice clearing, which result in adjustments to customer bookkeeping, a false positive could cause direct financial harm. A false negative (e.g., a missed clearing opportunity) is a much safer failure mode.

## Consequences

This decision makes robust duplicate detection and management a critical, first-class feature of the system. The system must include excellent tooling for operators to review, merge, and resolve these duplicates to maintain the long-term quality of the graph.

## Review Trigger

This decision should be revisited if the cost/benefit analysis of false positives vs. false negatives changes significantly, or if the system's analytical outputs no longer have direct financial implications for users.
